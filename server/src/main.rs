use std::error::Error;
use std::sync::Arc;

use modnsd::plugins::manager::PluginManager;
use clap::Parser;
use modnsd::plugins::executors::PluginManager;
use modnsd::listeners::{ApiListener, DnsListener, self};
use tokio::{net::{TcpListener, UnixListener, UdpSocket}, sync::RwLock};

mod config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    pretty_env_logger::init();

    let config = config::ServerConfig::parse();

    let pm_arc = Arc::new(RwLock::new(PluginManager::new()));

    {
        log::info!("Initializing plugins...");
        let mut pm = pm_arc.write().await;

        pm.search(config.plugin_path());
        log::info!("Plugin initialization successful");
    }

    let mut apiaddrs = Vec::new();

    log::info!("binding http listener...");
    apiaddrs.push(ApiListener::Tcp(TcpListener::bind(("0.0.0.0", 8080)).await?));

    log::info!("binding UNIX socket listener...");
    apiaddrs.push(ApiListener::Unix(UnixListener::bind(config.unix_socket())?));


    log::info!("Success");

    log::info!("binding DNS listener");
    let dnsaddrs = vec![
        DnsListener::Udp(UdpSocket::bind(("0.0.0.0", 5300)).await?)
    ];

    listeners::listen(apiaddrs, dnsaddrs, pm_arc).await;

    std::fs::remove_file(config.unix_socket())?;

    Ok(())

}
