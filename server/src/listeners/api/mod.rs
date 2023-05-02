
mod routes;
use futures::Future;
use futures::future::join_all;
use routes::*;

use tokio::task::JoinHandle;
use warp::{Filter, Reply};
use tokio::net::UnixListener;
use tokio::sync::{broadcast, RwLock};
use tokio_stream::wrappers::UnixListenerStream;
use std::fmt::Display;
use std::net::{SocketAddr, Ipv4Addr};
use std::path::PathBuf;
use std::sync::Arc;
use anyhow::{Result, Context};

use crate::plugins::manager::PluginManager;

#[derive(Debug)]
pub enum ApiListener {
    Http(SocketAddr),
    Unix(PathBuf),
    Https{
        addr: SocketAddr,
        cert: PathBuf,
        key: PathBuf
    }
}

impl Display for ApiListener {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiListener::Http(address) => {
                write!(f, "HTTP listener ({address})")
            },
            ApiListener::Unix(path) => {
                write!(f, "Unix socket ({})", path.display())
            },
            ApiListener::Https { addr: address, .. } => {
                write!(f, "HTTPS ({address})")
            },
        }
    }
}

impl ApiListener {
    fn spawn<F>(self, filter: F, signal: impl Future<Output = ()> + Send + 'static) -> Result<JoinHandle<()>> where
        F: Filter + Clone + Send + Sync + 'static,
        F::Extract: Reply
    {
        let h = match self {
            ApiListener::Http(addr) => {
                tokio::spawn(
                    warp::serve(filter)
                        .bind_with_graceful_shutdown(addr, signal).1
                )
            },
            ApiListener::Unix(path) => {
                let listener = UnixListener::bind(&path)
                    .context(format!("Failed to bind Unix Socket at {}", path.display()))?;

                let stream = UnixListenerStream::new(listener);

                tokio::spawn(
                    warp::serve(filter)
                        .serve_incoming_with_graceful_shutdown(stream, signal)
                )
            },
            ApiListener::Https { addr, cert, key } => {
                tokio::spawn(
                    warp::serve(filter)
                        .tls()
                        .cert_path(cert)
                        .key_path(key)
                        .bind_with_graceful_shutdown(addr, signal)
                    .1
                )
            },
        };

        Ok(h)
    }
}

pub async fn listen_api(shutdown_channel: broadcast::Sender<()>, pm: Arc<RwLock<PluginManager>>) -> Result<()>{

    let tasks = {
        let cfg_lock = pm.read().await;
        let cfg = cfg_lock.config();

        let filter = root_redirect()
            .or(frontend_filter(cfg.frontend_dir(), cfg.headless()))
            .or(api_filter(pm.clone()))
            .with(warp::log("modnsd::listeners::api"));

        let mut tasks = Vec::new();

        let unix_listener = ApiListener::Unix(cfg.unix_socket().to_path_buf());

        log::info!("Starting api on {unix_listener}");

        let mut unix_shutdown = shutdown_channel.subscribe();
        tasks.push(unix_listener.spawn(filter.clone(), async move {
            let _ = unix_shutdown.recv().await;
        })?);

        let http_listener = if cfg.https() {
            ApiListener::Https {
                addr: SocketAddr::from((Ipv4Addr::UNSPECIFIED, cfg.api_port())),
                cert: cfg.tls_cert().to_path_buf(),
                key: cfg.tls_key().to_path_buf(),
            }
        } else {
            ApiListener::Http(SocketAddr::from((Ipv4Addr::UNSPECIFIED, cfg.api_port())))
        };

        log::info!("Starting api on {http_listener}");

        let mut http_shutdown = shutdown_channel.subscribe();
        tasks.push(http_listener.spawn(filter, async move {
            let _ = http_shutdown.recv().await;
        })?);

        tasks
    };
    
    join_all(tasks).await;

    log::info!("API server shut down successfully");

    Ok(())
}
