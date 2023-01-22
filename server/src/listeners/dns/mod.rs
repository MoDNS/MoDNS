
use tokio::net::{UdpSocket};
use std::error::Error;
use std::net::SocketAddr;
use std::io;
use std::sync::Arc;

const MAX_DGRAM_SIZE: usize = 65_507;

pub async fn listen_dns(addr: SocketAddr) -> Result<(), io::Error> {
    
    let sock = Arc::new(UdpSocket::bind(addr).await?);

    let listener = sock.clone();

    let responder = sock.clone();

    let mut buf = [0; MAX_DGRAM_SIZE];

    loop {
        let (req_size, req_addr) = listener.recv_from(&mut buf).await?;

        tokio::spawn(async move {
            if let Err(e) = handle_request(&buf[..req_size], req_addr, responder.clone()).await{
                println!("Got Err handling request: {e:?}")
            };
        });
    }

}

// Naively forwards request to 8.8.8.8
// TO BE REPLACED WITH ACTUAL LOGIC
async fn handle_request(req: &[u8], resp_addr: SocketAddr, responder: Arc<UdpSocket>) -> Result<(), Box<dyn Error>>{

    let localaddr = if resp_addr.is_ipv4() {
        "0.0.0.0:0"
    } else {
        "[::]:0"
    }.parse::<SocketAddr>()?;

    let sock = UdpSocket::bind(localaddr).await?;

    sock.connect("8.8.8.8:53").await?;

    let mut buf = [0; MAX_DGRAM_SIZE];

    sock.send(&req).await?;

    let resp_size = sock.recv(&mut buf).await?;

    sock.send(&buf[..resp_size]).await?;

    Ok(())
}