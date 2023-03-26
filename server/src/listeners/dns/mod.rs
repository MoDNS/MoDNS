
use modns_sdk::ffi;

use anyhow::Result;
use futures::future::try_join_all;
use tokio::net::UdpSocket;
use tokio::sync::{broadcast, RwLock};
use std::sync::Arc;

use crate::plugins::manager::PluginManager;
use crate::plugins::plugin::PluginExecutorError;

const MAX_DGRAM_SIZE: usize = 65_507;

pub enum DnsListener{
    Udp(UdpSocket)
}

/// Starts a single DNS listener bound to the provided socket address
/// 
/// When listener recieves a request, it spawns a new async task to
/// handle that request with the `handle_request` function
pub async fn listen_dns(listeners: Vec<DnsListener>, shutdown_sig: broadcast::Sender<()>, pm_arc: Arc<RwLock<PluginManager>>) -> Result<()> {

    try_join_all(listeners.into_iter().map(|l| async {

        let shutdown_rx = shutdown_sig.subscribe();

        match l {
            DnsListener::Udp(s) => listen_dns_udp(s, shutdown_rx, pm_arc.clone()).await
        }

    })).await?;

    Ok(())
}

pub async fn listen_dns_udp(sock: UdpSocket, mut shutdown: broadcast::Receiver<()>, pm_arc: Arc<RwLock<PluginManager>>) -> Result<()> {
    
    let sock = Arc::new(sock);

    log::info!("Started DNS listener on {}", sock.local_addr()?);

    let mut buf = [0; MAX_DGRAM_SIZE];

    loop {

        tokio::select! {

            _ = shutdown.recv() => {

                log::info!("Shutting down DNS listener on {}", sock.local_addr()?);

                return Ok(())
            },

            res = sock.recv_from(&mut buf) => {

                let (req_size, req_addr) = res?;

                log::debug!("Got {req_size}-byte DNS request from {req_addr}");

                let responder = sock.clone();

                let pm = pm_arc.clone();

                tokio::spawn(async move {
                    match handle_request(buf[..req_size].to_vec(), pm.clone()).await {
                        Err(e) => {
                            log::warn!("Could not respond to request from {req_addr}: {e:?}");
                        },
                        Ok(resp) => {
                            match responder.send_to(&resp[..], req_addr).await {
                                Err(e) => {
                                    log::warn!("Got `Err` while responding to {req_addr}: {e:?}");
                                }
                                Ok(resp_len) => {
                                    log::debug!("Sucessfully sent {resp_len}-byte response to {req_addr}")
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
async fn handle_request(encoded_req: Vec<u8>, pm_guard: Arc<RwLock<PluginManager>>) -> Result<Vec<u8>, PluginExecutorError>{

    let decoder = pm_guard.clone().read_owned().await;
    let req = tokio::task::spawn_blocking(move || {
        decoder.decode(encoded_req.as_ref())
    }).await;

    let req_id = if let Ok(Ok(req_message)) = &req {
        req_message.id
    } else {
        0
    };

    let resolver = pm_guard.clone().read_owned().await;
    let resp = match req {
        Ok(Ok(req_msg)) => tokio::task::spawn_blocking(move || {
            log::debug!("Successfully decoded request with id {}, attempting to resolve...", req_id);
            resolver.resolve(req_msg)
        }).await.unwrap_or_else(|e|{
            log::error!("Failed to join a thread while resolving request {}: {e:?}", req_id);
            Ok(Box::new(Default::default()))
        }).and_then(|resp| {
            log::debug!("Resolver returned successfully");
            Ok(resp)
        }).unwrap_or_else(|e| {
            log::error!("Resolver plugin failed: {e:?}");
            if let PluginExecutorError::ErrorCode(rc) = e {
                Box::new(ffi::DnsMessage::with_error_code(rc))
            } else {
                Default::default()
            }
        }),

        Ok(Err(PluginExecutorError::ErrorCode(rc))) => Box::new(ffi::DnsMessage::with_error_code(rc)),
        _ => Box::new(Default::default())
    };

    log::debug!("Attempting to encode response for request {req_id}");
    let encoder = pm_guard.read_owned().await;
    tokio::task::spawn_blocking(move || {
        encoder.encode(resp)
    }).await
    .unwrap_or_else(|e| Err(PluginExecutorError::ThreadJoinFailed(e.to_string())))
}

