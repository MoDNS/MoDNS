use std::{task::{Context, Poll}, pin::Pin};

use axum::BoxError;
use futures::ready;
use tokio::{net::{UnixStream, UnixListener}, io::AsyncWrite};
use warp::hyper::{server::accept::Accept, client::connect::{Connection, Connected}};

//% Provides wrappers for Unix Domain Socket connections that
//% allow them to be used for an Axum server

pub struct UnixApiListener(pub UnixListener);

pub struct UnixApiConnection(UnixStream);

impl Accept for UnixApiListener {
    type Conn = UnixStream;

    type Error = BoxError;

    fn poll_accept(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> std::task::Poll<Option<Result<Self::Conn, Self::Error>>> {
        let (stream, _) = ready!(self.0.poll_accept(cx))?;
        Poll::Ready(Some(Ok(stream)))
    }
}

impl AsyncWrite for UnixApiConnection {
    fn poll_write(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<Result<usize, std::io::Error>> {
        Pin::new(&mut self.0).poll_write(cx, buf)
    }

    fn poll_flush(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        Pin::new(&mut self.0).poll_flush(cx)
    }

    fn poll_shutdown(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), std::io::Error>> {
        Pin::new(&mut self.0).poll_shutdown(cx)
    }
}

impl Connection for UnixApiConnection {
    fn connected(&self) -> Connected {
        Connected::new()
    }
}
