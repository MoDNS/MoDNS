use std::error::Error;

use lazy_static::lazy_static;
use modnsd::plugins::executors::{PluginManager, DnsPlugin};
use modnsd::plugins::loaders::LibraryManager;
use modnsd::listeners::{ApiListener, DnsListener, self};
use tokio::{net::{TcpListener, UnixListener, UdpSocket}, sync::RwLock};

lazy_static! {
    static ref LIB_MANAGER_LOCK: RwLock<LibraryManager> = RwLock::const_new(LibraryManager::new());
    static ref PLUGIN_VEC_LOCK: RwLock<Vec<DnsPlugin<'static>>> = RwLock::const_new(Vec::new());
    static ref PLUGIN_MANAGER_LOCK: RwLock<PluginManager<'static>> = RwLock::const_new(PluginManager::empty());
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
