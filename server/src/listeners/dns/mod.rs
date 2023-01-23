
use tokio::net::{UdpSocket};
use std::error::Error;
use std::net::SocketAddr;
use std::io;
use std::sync::Arc;

const MAX_DGRAM_SIZE: usize = 65_507;

pub async fn listen_dns(addr: SocketAddr) -> Result<(), io::Error> {
    
    // 
    let sock = Arc::new(UdpSocket::bind(addr).await?);

    log::info!(target: "dns::listener", "Started DNS listener on {addr}");

    let mut buf = [0; MAX_DGRAM_SIZE];

    loop {
        let (req_size, req_addr) = sock.recv_from(&mut buf).await?;

        log::debug!(target: "dns::listener","Got DNS request from {req_addr}");

        let responder = sock.clone();

        tokio::spawn(async move {
            if let Err(e) = handle_request(&buf[..req_size], &req_addr, &*responder).await{
                println!("Got Err handling request: {e:?}")
            };
        });
    }

}

// Naively forwards request to 8.8.8.8
// Will replace with actual logic once plugins are a thing
async fn handle_request(req: &[u8], resp_addr: &SocketAddr, responder: &UdpSocket) -> Result<(), Box<dyn Error>>{

    let localaddr = if resp_addr.is_ipv4() {
        "0.0.0.0:0"
    } else {
        "[::]:0"
    }.parse::<SocketAddr>()?;

    let requester = UdpSocket::bind(localaddr).await?;

    requester.connect("8.8.8.8:53").await?;

    let mut buf = [0; MAX_DGRAM_SIZE];

    requester.send(&req).await?;

    log::debug!(target: "dns::listener", "Sent request to 8.8.8.8");

    let resp_size = requester.recv(&mut buf).await?;

    log::debug!(target: "dns::listener", "Got response, forwarding to client");

    responder.send_to(&buf[..resp_size], resp_addr).await?;

    Ok(())
}