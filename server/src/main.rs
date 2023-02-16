use std::error::Error;

use lazy_static::lazy_static;
use modnsd::plugins::executors::PluginManager;
use modnsd::listeners::{ApiListener, DnsListener, self};
use tokio::{net::{TcpListener, UnixListener, UdpSocket}, sync::RwLock};

lazy_static! {
    static ref PLUGIN_MANAGER_LOCK: RwLock<PluginManager> = RwLock::const_new(PluginManager::new());
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    pretty_env_logger::init();

    let apiaddrs = vec![
        ApiListener::Tcp(TcpListener::bind(("0.0.0.0", 80)).await?), 
        ApiListener::Unix(UnixListener::bind("./modnsd.sock")?)
    ];

    let dnsaddrs = vec![
        DnsListener::Udp(UdpSocket::bind(("0.0.0.0", 53)).await?)
    ];

    listeners::listen(apiaddrs, dnsaddrs, &PLUGIN_MANAGER_LOCK).await;

    Ok(())

}
