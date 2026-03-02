use axum::{
    extract::Multipart,
    Json,
};
use serde::Serialize;
use std::process::Command;
use std::fs;
use uuid::Uuid;

use crate::errors::AppError;

const MAX_WASM_SIZE: usize = 3 * 1024 * 1024;

#[derive(Serialize)]
pub struct ValidationResponse {
    pub valid: bool,
    pub message: String,
    pub size_bytes: usize,
}

pub async fn validate_contract(
    mut multipart: Multipart,
) -> Result<Json<ValidationResponse>, AppError> {

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::Internal)?
    {
        if let Some(file_name) = field.file_name() {

            if !file_name.ends_with(".wasm") {
                return Err(AppError::Validation(
                    "Only .wasm files are allowed".into(),
                ));
            }

            let data = field
                .bytes()
                .await
                .map_err(|_| AppError::Internal)?;

            let size = data.len();

            if size > MAX_WASM_SIZE {
                return Err(AppError::Validation(
                    format!("WASM exceeds max size ({} bytes)", MAX_WASM_SIZE),
                ));
            }

            //creates temp files for checking
            let temp_file = format!("/tmp/{}.wasm", Uuid::new_v4());
            fs::write(&temp_file, &data)
                .map_err(|_| AppError::Internal)?;

            //cli
            let output = Command::new("cosmwasm-check")
                .arg(&temp_file)
                .output()
                .map_err(|_| AppError::Internal)?;

            //clean fule
            let _ = fs::remove_file(&temp_file);

            if output.status.success() {
                return Ok(Json(ValidationResponse {
                    valid: true,
                    message: "WASM contract passed CosmWasm validation".into(),
                    size_bytes: size,
                }));
            } else {
                let stdout_msg = String::from_utf8_lossy(&output.stdout);
                let stderr_msg = String::from_utf8_lossy(&output.stderr);
            
                let combined = format!("{}\n{}", stdout_msg, stderr_msg);
            
                return Err(AppError::Validation(combined.trim().to_string()));
            }
        }
    }

    Err(AppError::Validation(
        "No .wasm file provided".into(),
    ))
}