use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "sc", about = "Smart Contract CLI Validator")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    Validate {
        #[arg(help = "Input file path")]
        path: String,

        #[arg(long, help = "Network name (e.g. sepolia)")]
        network: String,
    },
}

