
mod routes;
use routes::*;

use warp::Filter;
use tokio::net::{TcpListener, UnixListener};
use tokio::sync::{broadcast, RwLock};
use tokio_stream::wrappers::{UnixListenerStream, TcpListenerStream};
use futures::{future::join_all, FutureExt};
use std::fmt::Display;
use std::sync::Arc;
use anyhow::Result;

use crate::plugins::manager::PluginManager;

#[derive(Debug)]
pub enum ApiListener {
    Tcp(TcpListener),
    Unix(UnixListener),
}

impl Display for ApiListener {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiListener::Tcp(l) => {
                let addr = l.local_addr()
                .and_then(|a| Ok(a.to_string()))
                .unwrap_or("unknown addr".to_owned());

                write!(f, "TCP socket ({addr})")
            },
            ApiListener::Unix(l) => {
                let path = match l.local_addr() {
                    Ok(a) => {
                        a.as_pathname()
                        .map_or(
                            "anonymous".to_owned(),
                            |p| p.to_string_lossy().to_string()
                        )
                    },
                    Err(e) => format!("failed to get path: {e}"),
                };
                
                write!(f, "Unix socket ({path})")
            },
        }
    }
}

<<<<<<< HEAD
pub async fn listen_api(listeners: Vec<ApiListener>, shutdown_channel: broadcast::Sender<()>, pm: Arc<RwLock<PluginManager>>, cfg: &ServerConfig) -> Result<()>{
=======
pub async fn listen_api(listeners: Vec<ApiListener>, shutdown_channel: broadcast::Sender<()>, pm: Arc<RwLock<PluginManager>>) -> Result<()>{
    // let pm_arc = Arc::new(RwLock::new(PluginManager::new()));
>>>>>>> d2d3e5a03b4dc4ab03f07f7bad21b2b7bd5f1ecc
    
    let api_filter = api_filter(pm.clone());
    let pm = pm.read().await;

    let frontend_routes = root_redirect()
        .or(frontend_filter(pm.config().frontend_dir(), pm.config().headless()))
        .or(api_filter)
        .with(warp::log("modnsd::listeners::api"));


    join_all(listeners.into_iter().map(|l| {
        let server = warp::serve(frontend_routes.clone());

        let mut shutdown_rx = shutdown_channel.subscribe();
        log::info!("Starting API server on {l}");

        match l {
            ApiListener::Tcp(l) => server.serve_incoming_with_graceful_shutdown(
                TcpListenerStream::new(l), 
                async move {shutdown_rx.recv().await.unwrap_or(());}
            ).left_future(),

            ApiListener::Unix(l) => server.serve_incoming_with_graceful_shutdown(
                UnixListenerStream::new(l),
                async move {shutdown_rx.recv().await.unwrap_or(());}
            ).right_future()
        }
    })).await;

    log::info!("API server shut down successfully");

    Ok(())
}
