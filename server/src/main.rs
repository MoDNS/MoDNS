use std::error::Error;
use std::path::PathBuf;
use std::sync::Arc;

use modnsd::plugins::executors::PluginManager;
use modnsd::listeners::{ApiListener, DnsListener, self};
use tokio::{net::{TcpListener, UnixListener, UdpSocket}, sync::RwLock};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    pretty_env_logger::init();

    let pm_arc = Arc::new(RwLock::new(PluginManager::new()));

    {
        log::info!("Initializing plugins...");
        let mut pm = pm_arc.write().await;

        pm.search(&[PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../plugins").canonicalize()?]);
        log::info!("Plugin initialization successful");
    }

    let mut apiaddrs = Vec::new();

    log::info!("binding http listener...");
    apiaddrs.push(ApiListener::Tcp(TcpListener::bind(("0.0.0.0", 8080)).await?));

    log::info!("binding UNIX socket listener...");
    apiaddrs.push(ApiListener::Unix(UnixListener::bind("./modnsd.sock")?));


    log::info!("Success");

    log::info!("binding DNS listener");
    let dnsaddrs = vec![
        DnsListener::Udp(UdpSocket::bind(("0.0.0.0", 5300)).await?)
    ];

    listeners::listen(apiaddrs, dnsaddrs, pm_arc).await;

    std::fs::remove_file("./modnsd.sock")?;

    Ok(())

}
