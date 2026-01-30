use anyhow::Result;
use clap::Parser;

mod cli;
mod validator;

use cli::{Cli, Commands};

fn main() -> Result<()> {
    dotenvy::dotenv().ok();

    let cli = Cli::parse();

    match cli.command {
        Commands::Validate { path, network } => {
            validator::input::validate_input_file(&path)?;
            validator::network::validate_network(&network)?;
            validator::env::validate_required_vars(&[
                "PRIVATE_KEY",
                &format!("{}_RPC", network.to_uppercase()),
            ])?;

            println!("Validation successful");
        }
    }

    Ok(())
}

