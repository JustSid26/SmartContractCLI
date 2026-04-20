use axum::{
    extract::Multipart,
    Json,
};
use serde::Serialize;
use std::process::Command;
use std::fs;
use uuid::Uuid;
use std::sync::Arc;
use solana_rbpf::{
    elf::Executable,
    vm::TestContextObject,
};

use crate::errors::AppError;

const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB

#[derive(Serialize)]
pub struct ValidationResponse {
    pub valid: bool,
    pub message: String,
    pub size_bytes: usize,
    pub abi: Option<String>,
    pub bytecode: Option<String>,
}

pub async fn validate_contract(
    mut multipart: Multipart,
) -> Result<Json<ValidationResponse>, AppError> {
    let mut chain = String::new();
    let mut file_data = None;
    let mut file_name_str = String::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::Internal)?
    {
        if let Some(name) = field.name() {
            if name == "chain" {
                chain = field.text().await.map_err(|_| AppError::Internal)?;
            } else if name == "file" {
                if let Some(fn_name) = field.file_name() {
                    file_name_str = fn_name.to_string();
                }
                let data = field.bytes().await.map_err(|_| AppError::Internal)?;
                file_data = Some(data);
            }
        }
    }

    let data = file_data.ok_or_else(|| AppError::Validation("No file provided".into()))?;
    let size = data.len();

    if size > MAX_FILE_SIZE {
        return Err(AppError::Validation(
            format!("File exceeds max size ({} bytes)", MAX_FILE_SIZE),
        ));
    }

    if chain == "Solana" {
        if !file_name_str.ends_with(".so") {
            return Err(AppError::Validation("Only .so files are allowed for Solana".into()));
        }
        
        let _executable = Executable::<TestContextObject>::from_elf(
            &data,
            Arc::new(solana_rbpf::program::BuiltinProgram::new_mock()),
        ).map_err(|e| AppError::Validation(format!("Solana BPF ELF validation failed: {:?}", e)))?;

        return Ok(Json(ValidationResponse {
            valid: true,
            message: "Solana BPF contract passed validation".into(),
            size_bytes: size,
            abi: None,
            bytecode: None,
        }));

    } else if chain == "Solidity" {
        if !file_name_str.ends_with(".sol") {
            return Err(AppError::Validation("Only .sol files are allowed for Solidity".into()));
        }

        let source_code = String::from_utf8(data.to_vec())
            .map_err(|_| AppError::Validation("File is not valid UTF-8".into()))?;

        // Parse with solang-parser
        let (_ast, mut _comments) = solang_parser::parse(&source_code, 0)
            .map_err(|diagnostics| {
                let err_msgs: Vec<String> = diagnostics
                    .iter()
                    .map(|d| format!("{:?}", d))
                    .collect();
                AppError::Validation(format!("Solidity parser errors:\n{}", err_msgs.join("\n")))
            })?;

        // Basic vulnerability scanning (Static Analysis representation)
        let mut warnings = Vec::new();
        if source_code.contains("tx.origin") {
            warnings.push("WARNING: Found 'tx.origin'. Use 'msg.sender' to prevent phishing attacks.");
        }
        if source_code.contains(".call{value:") && !source_code.contains("nonReentrant") {
            warnings.push("WARNING: External raw call detected without explicit reentrancy guard.");
        }

        let mut msg = "Solidity contract parsed successfully.".to_string();
        if !warnings.is_empty() {
            msg.push_str(&format!("\n{}", warnings.join("\n")));
        }

        let mut abi_opt = None;
        let mut bytecode_opt = None;

        // Compile with local solc
        let temp_file = format!("/tmp/{}.sol", Uuid::new_v4());
        if let Ok(_) = std::fs::write(&temp_file, &data) {
            if let Ok(output) = Command::new("./solc")
                .args(["--combined-json", "abi,bin", &temp_file])
                .output()
            {
                if output.status.success() {
                    let out_str = String::from_utf8_lossy(&output.stdout);
                    if let Ok(parsed_json) = serde_json::from_str::<serde_json::Value>(&out_str) {
                        if let Some(contracts) = parsed_json.get("contracts").and_then(|c| c.as_object()) {
                            // Extract the first contract found in the file
                            if let Some((_, contract_data)) = contracts.iter().next() {
                                if let Some(abi_val) = contract_data.get("abi") {
                                    abi_opt = Some(abi_val.to_string());
                                }
                                if let Some(bin_val) = contract_data.get("bin").and_then(|v| v.as_str()) {
                                    bytecode_opt = Some(bin_val.to_string());
                                }
                                msg.push_str("\nContract successfully compiled with solc.");
                            }
                        }
                    }
                }
            }
            let _ = std::fs::remove_file(&temp_file);
        }

        return Ok(Json(ValidationResponse {
            valid: true,
            message: msg,
            size_bytes: size,
            abi: abi_opt,
            bytecode: bytecode_opt,
        }));
    } else {
        // Assume CosmWasm
        if !file_name_str.ends_with(".wasm") {
            return Err(AppError::Validation("Only .wasm files are allowed for CosmWasm".into()));
        }

        let temp_file = format!("/tmp/{}.wasm", Uuid::new_v4());
        fs::write(&temp_file, &data)
            .map_err(|_| AppError::Internal)?;

        let output = Command::new("cosmwasm-check")
            .arg(&temp_file)
            .output()
            .map_err(|_| AppError::Internal)?;

        let _ = fs::remove_file(&temp_file);

        if output.status.success() {
            return Ok(Json(ValidationResponse {
                valid: true,
                message: "WASM contract passed CosmWasm validation".into(),
                size_bytes: size,
                abi: None,
                bytecode: None,
            }));
        } else {
            let stdout_msg = String::from_utf8_lossy(&output.stdout);
            let stderr_msg = String::from_utf8_lossy(&output.stderr);
        
            let combined = format!("{}\n{}", stdout_msg, stderr_msg);
        
            return Err(AppError::Validation(combined.trim().to_string()));
        }
    }
}