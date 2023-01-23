use std::error::Error;

use modnsd::listeners::{ApiListener, DnsListener, self};
use tokio::net::{TcpListener, UnixListener, UdpSocket};

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

    listeners::listen(apiaddrs, dnsaddrs).await;

    Ok(())

}
