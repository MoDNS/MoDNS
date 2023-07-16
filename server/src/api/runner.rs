use std::{path::PathBuf, net::SocketAddr, sync::Arc};

use axum_server::tls_rustls::RustlsConfig;
use tokio::{net::UnixListener, sync::RwLock};
use anyhow::{Result, Context};

mod unix;

use unix::UnixApiListener;

use crate::PluginManager;

use super::routes;

pub enum ApiConfig {
    Unix(PathBuf),
    Http(SocketAddr),
    Https {
        addr: SocketAddr,
        cert: PathBuf,
        key: PathBuf
    }
}

pub async fn run(config: ApiConfig, state: Arc<RwLock<PluginManager>>) -> Result<()> {

    let app = routes::router(state);

    match config {
        ApiConfig::Unix(addr) => {
            let sock = UnixListener::bind(addr)
                .context("Failed to bind Unix listener")?;

            let _ = axum::Server::builder(UnixApiListener(sock))
                .serve(app.into_make_service()).await;
        },
        ApiConfig::Http(addr) => {
            let _ = axum::Server::try_bind(&addr)
                .with_context(|| format!("Failed to bind HTTP listener on {addr}"))?
                .serve(app.into_make_service()).await;
        },
        ApiConfig::Https { addr, cert, key } => {
            let tls_config = RustlsConfig::from_pem_file(cert, key).await
                .context("Failed to obtain TLS certificates")?;

            axum_server::bind_rustls(addr, tls_config)
                .serve(app.into_make_service()).await
                .with_context(|| format!("Failed to bind HTTPS listener on {addr}"))?;
        },
    };

    Ok(())
}
