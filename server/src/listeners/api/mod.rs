
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

pub async fn listen_on<'a>(listeners: Vec<ApiListener>) {

    let routes = root_redirect().or(frontend_filter()).with(warp::log("http::frontend"));

    let mut servers = Vec::with_capacity(listeners.len());

    for listener in listeners {
        let server = warp::serve(routes.clone());

        let active_server = match listener {
            ApiListener::Tcp(listener) => Either::Left(server.run_incoming(TcpListenerStream::new(listener))),
            ApiListener::Unix(listener) => Either::Right(server.run_incoming(UnixListenerStream::new(listener))),
        };

        servers.push(active_server);
    }

    join_all(servers).await;

}