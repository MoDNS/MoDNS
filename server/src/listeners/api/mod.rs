
mod routes;

use routes::*;

use warp::Filter;
use tokio::net::{TcpListener, UnixListener};
use tokio::sync::broadcast;
use tokio_stream::wrappers::{UnixListenerStream, TcpListenerStream};
use futures::future::{Either, join_all};

pub enum ApiListener {
    Tcp(TcpListener),
    Unix(UnixListener),
}

<<<<<<< HEAD
pub async fn listen_on(listeners: Vec<ApiListener>) {
=======
pub async fn listen_api(listeners: Vec<ApiListener>, shutdown_channel: broadcast::Sender<()>) -> Result<(), Box<dyn Error + Sync + Send>>{
>>>>>>> 0b6625b... Implemented graceful shutdown for DNS and API
    let frontend_routes = root_redirect().or(frontend_filter()).with(warp::log("http::frontend"));

    join_all(listeners.into_iter().map(|l| {
        let server = warp::serve(frontend_routes.clone());

        let mut shutdown_rx = shutdown_channel.subscribe();

        match l {
<<<<<<< HEAD
            ApiListener::Tcp(l) => Either::Left(server.run_incoming(TcpListenerStream::new(l))),
            ApiListener::Unix(l) => Either::Right(server.run_incoming(UnixListenerStream::new(l)))
        }
    })).await;
=======
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
>>>>>>> 0b6625b... Implemented graceful shutdown for DNS and API
}