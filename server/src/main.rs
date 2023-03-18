use std::sync::Arc;

use anyhow::Context;
use modnsd::plugins::manager::PluginManager;
use modnsd::listeners::{ApiListener, DnsListener, self};

use clap::Parser;
use tokio::{net::{TcpListener, UnixListener, UdpSocket}, sync::RwLock};

mod config;

#[tokio::main]
async fn main() -> anyhow::Result<()> {

    pretty_env_logger::init();

    let config = config::ServerConfig::parse();

    let pm_arc = Arc::new(RwLock::new(PluginManager::new()));

    {
        log::info!("Initializing plugins...");
        let mut pm = pm_arc.write().await;

        pm.search(config.plugin_path())
        .or_else(|e| {

            log::error!("Got an error during initial plugin search: {e}");
            log::debug!("Full error: {e:#?}");

            if config.strict_init() {
                Err(e)
                .context("Server refused to start because plugin initialization ran into an error\
                and the `--ignore-init-errors` flag is set to `never`")
            } else {
                Ok(())
            }
        })?;

        pm.validate(!config.always_init())
        .context("Server refused to start because it does not have enough plugins enabled to resolve DNS requests.
        To ignore this case and start anyway, run with `--ignore-init-errors always`")?;

        log::info!("Plugin initialization successful");
    }

    log::info!("Binding API listeners");
    let apiaddrs = vec![
        ApiListener::Tcp(
            TcpListener::bind(("0.0.0.0", 8080)).await
            .context("Failed to bind TCP listener on port 8080")?
        ),

        ApiListener::Unix(
            UnixListener::bind(config.unix_socket())
            .with_context(|| format!("Failed to bind Unix listener on {}", config.unix_socket().display()))?
        ),
    ];

    log::info!("Binding DNS listener");
    let dnsaddrs = vec![
        DnsListener::Udp(UdpSocket::bind(("0.0.0.0", 5300)).await.context("Failed to bind DNS listener on port 5300/udp")?)
    ];

    listeners::listen(apiaddrs, dnsaddrs, pm_arc).await;

    std::fs::remove_file(config.unix_socket())
    .with_context(|| format!("Failed to remove unix socket at {}", config.unix_socket().display()))?;

    Ok(())

}
