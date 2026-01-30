use anyhow::{Result, bail};
use std::env;

pub fn validate_required_vars(vars: &[&str]) -> Result<()> {
    for v in vars {
        if env::var(v).is_err() {
            bail!("Environment variable {} not set", v);
        }
    }
    Ok(())
}

