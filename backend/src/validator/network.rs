use anyhow::{Result, bail};

const ALLOWED_NETWORKS: &[&str] = &[
    "localhost",
    "sepolia",
    "goerli",
    "mainnet",
];

pub fn validate_network(network: &str) -> Result<()> {
    if !ALLOWED_NETWORKS.contains(&network) {
        bail!(
            "Invalid network '{}'. Allowed: {:?}",
            network,
            ALLOWED_NETWORKS
        );
    }
    Ok(())
}

