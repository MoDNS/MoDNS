
use futures::future::try_join_all;
use tokio::net::UdpSocket;
use tokio::sync::broadcast;
use std::error::Error;
use std::net::SocketAddr;
use std::sync::Arc;

const MAX_DGRAM_SIZE: usize = 65_507;

pub enum DnsListener{
    Udp(UdpSocket)
}

/// Starts a single DNS listener bound to the provided socket address
/// 
/// When listener recieves a request, it spawns a new async task to
/// handle that request with the `handle_request` function
pub async fn listen_dns(listeners: Vec<DnsListener>, shutdown_sig: broadcast::Sender<()>) -> Result<(), Box<dyn Error + Sync + Send>> {

    try_join_all(listeners.into_iter().map(|l| async {

        let shutdown_rx = shutdown_sig.subscribe();

        match l {
            DnsListener::Udp(s) => listen_dns_udp(s, shutdown_rx).await
        }

    })).await?;

    Ok(())
}

pub async fn listen_dns_udp(sock: UdpSocket, mut shutdown: broadcast::Receiver<()>) -> Result<(), Box<dyn Error + Sync + Send>> {
    
    let sock = Arc::new(sock);

    log::info!(target: "dns::listener", "Started DNS listener on {}", sock.local_addr()?);

    let mut buf = [0; MAX_DGRAM_SIZE];

    loop {

        tokio::select! {

            _ = shutdown.recv() => {

                log::info!(target: "dns::listener", "Shutting down DNS listener on {}", sock.local_addr()?);

                return Ok(())
            },

            res = sock.recv_from(&mut buf) => {

                let (req_size, req_addr) = res?;

                log::debug!(target: "dns::listener","Got {req_size}-byte DNS request from {req_addr}");

                let responder = sock.clone();

                tokio::spawn(async move {
                    match handle_request(&buf[..req_size], req_addr.is_ipv4()).await {
                        Err(e) => {
                            log::warn!(target: "dns::responder", "Got `Err` while fulfilling request from {req_addr}: {e:?}");
                        },
                        Ok(resp) => {
                            match responder.send_to(&resp, req_addr).await {
                                Err(e) => {
                                    log::warn!(target: "dns::responder", "Got `Err` while responding to {req_addr}: {e:?}");
                                }
                                Ok(resp_len) => {
                                    log::trace!(target: "dns::responder", "Sucessfully sent {resp_len}-byte response to {req_addr}")
                                }
                            };
                        },
                    };
                });

            }

        }

    }

}

/// Handle a DNS request by querying enabled modules
/// 
/// Currently, this function just naively forwards request to 8.8.8.8 and returns the response
/// 
/// This will be replaced with actual logic once plugins are a thing
/// 
/// Arguments:
/// 
///   `req`: A reference to the raw bytes sent in the requeest
/// 
///   `ipv4`: Whether or not the request was via IPv4. Used to determine
///   whether to use IPv4 or IPv6 when communicating with the
///   upstream DNS server
/// 
/// On success, returns vector of bytes to reply to the request with
async fn handle_request(req: &[u8], ipv4: bool) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>>{

    // Allow for IPv6 addresses by binding to an IPv6 socket if the request is IPv6
    let local_addr =
    if ipv4 { "0.0.0.0:0" }
    else { "[::]:0" }
    .parse::<SocketAddr>()?;

    let resolver_addr = 
    if ipv4 { "8.8.8.8:53" }
    else { "[2001:4860:4860::8888]:53" }
    .parse::<SocketAddr>()?;

    let requester = UdpSocket::bind(local_addr).await?;

    requester.connect(resolver_addr).await?;

    // There is probably a better way to do this that doesn't require
    // allocating literal kilobytes every time we get a request, but eh
    let mut buf = vec![0; MAX_DGRAM_SIZE];

    requester.send(&req).await?;

    log::trace!(target: "dns::listener", "Sent request to 8.8.8.8");

    let resp_size = requester.recv(&mut buf).await?;

    // Shrink buffer down to only the necessary size to save on memory
    buf.truncate(resp_size);

    Ok(buf)
}