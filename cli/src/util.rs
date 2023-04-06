
use anyhow::{Context, Result};
use hyper::{Body, Request, Response, Client, body::HttpBody};
use hyperlocal::UnixClientExt;

use crate::CliOptions;

pub fn make_request(method: hyper::Method, path: &str, config: &CliOptions) -> Result<Response<String>> {

    let uri = if let Some(host) = config.remote_host() {
        hyper::Uri::builder()
        .scheme(if config.https() {"https"} else {"http"})
            .authority(host)
            .path_and_query(path)
            .build()
            .context("Couldn't construct request uri")?
    } else {
        hyperlocal::Uri::new(config.unix_socket(), path)
            .into()
    };

    if config.verbose() > 2 {
        eprintln!("URI: {uri:#?}");
    }

    let request = Request::builder()
        .method(method)
        .uri(uri)
        .body(Body::empty())
        .context("Couldn't construct request body")?;

    if config.verbose() > 2 {
        eprintln!("Sending request: {request:#?}");
    }

    send_request(request, !config.remote_host().is_some())

}

fn send_request(req: Request<Body>, unix: bool) -> Result<Response<String>> {
    let rt = tokio::runtime::Runtime::new().context("Failed to create runtime")?;

    let future = if unix {
        Client::unix().request(req)
    } else {
        Client::new().request(req)
    };

    let (parts, mut body) = rt.block_on(future)
        .context("Couldn't send http(s) request. Is the daemon running?")?
        .into_parts();

    let mut buf = Vec::new();
    while let Some(data) = rt.block_on(body.data()) {
        let bytes = data.context("Encountered error while receiving response")?;

        buf.extend(bytes);
    }

    let full_body = String::from_utf8(buf).context("Response was not UTF-8 encoded")?;

    Ok(Response::from_parts(parts, full_body))
}
