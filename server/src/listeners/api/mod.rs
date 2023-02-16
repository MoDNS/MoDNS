
mod routes;

use std::error::Error;

use routes::*;

use warp::Filter;
use tokio::net::{TcpListener, UnixListener};
use tokio::sync::broadcast;
use tokio_stream::wrappers::{UnixListenerStream, TcpListenerStream};
use futures::{future::join_all, FutureExt};

#[derive(Debug)]
pub enum ApiListener {
    Tcp(TcpListener),
    Unix(UnixListener),
}

pub async fn listen_api(listeners: Vec<ApiListener>, shutdown_channel: broadcast::Sender<()>) -> Result<(), Box<dyn Error + Sync + Send>>{
    let frontend_routes = root_redirect().or(frontend_filter()).with(warp::log("http::frontend"));

    join_all(listeners.into_iter().map(|l| {
        let server = warp::serve(frontend_routes.clone());

        let mut shutdown_rx = shutdown_channel.subscribe();
        log::info!("Starting API server on {l:?}");

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