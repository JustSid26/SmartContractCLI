use std::path::Path;
use anyhow::{Result, bail};

pub fn validate_input_file(path: &str) -> Result<()> {
    let p = Path::new(path);

    if !p.exists() {
        bail!(" File does not exist: {}", path);
    }

    if !p.is_file() {
        bail!("Path is not a file: {}", path);
    }

    Ok(())
}

