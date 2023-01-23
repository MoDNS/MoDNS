
mod routes;

use std::error::Error;

use routes::*;

use warp::Filter;
use tokio::net::{TcpListener, UnixListener};
use tokio_stream::wrappers::{UnixListenerStream, TcpListenerStream};
use futures::{future::join_all, FutureExt};

pub enum ApiListener {
    Tcp(TcpListener),
    Unix(UnixListener),
}

pub async fn listen_api(listeners: Vec<ApiListener>) -> Result<(), Box<dyn Error + Sync + Send>>{
    let frontend_routes = root_redirect().or(frontend_filter()).with(warp::log("http::frontend"));

    join_all(listeners.into_iter().map(|l| {
        let server = warp::serve(frontend_routes.clone());

        match l {
            ApiListener::Tcp(l) => server.run_incoming(TcpListenerStream::new(l)).left_future(),
            ApiListener::Unix(l) => server.run_incoming(UnixListenerStream::new(l)).right_future()
        }
    })).await;

    Ok(())
}