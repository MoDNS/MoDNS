
mod routes;

use routes::*;

use warp::Filter;
use tokio::net::{TcpListener, UnixListener};
use tokio_stream::wrappers::{UnixListenerStream, TcpListenerStream};
use futures::future::{Either, join_all};

pub enum ApiListener {
    Tcp(TcpListener),
    Unix(UnixListener),
}

pub async fn listen_api(listeners: Vec<ApiListener>) {
    let frontend_routes = root_redirect().or(frontend_filter()).with(warp::log("http::frontend"));

    join_all(listeners.into_iter().map(|l| {
        let server = warp::serve(frontend_routes.clone());

        match l {
            ApiListener::Tcp(l) => Either::Left(server.run_incoming(TcpListenerStream::new(l))),
            ApiListener::Unix(l) => Either::Right(server.run_incoming(UnixListenerStream::new(l)))
        }
    })).await;
}