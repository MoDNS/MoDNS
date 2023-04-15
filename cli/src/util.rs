
use std::collections::HashMap;

use anyhow::{Context, Result};
use hyper::{Body, Request, Response, Client, body::HttpBody, Method, StatusCode};
use hyperlocal::UnixClientExt;
use modnsd::plugins::metadata::PluginMetadata;
use uuid::Uuid;

use crate::CliOptions;

pub fn make_request(method: hyper::Method, path: &str, body: Option<Body>, config: &CliOptions) -> Result<Response<String>> {

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

pub fn get_plugin_list(config: &CliOptions, filter: &str) -> Result<HashMap<Uuid, PluginMetadata>> {

    let resp = make_request(Method::GET, &format!("/api/plugins?{filter}"), None, config)
        .context("Unable to request plugin metadata")?;

    if resp.status() != StatusCode::OK {
            anyhow::bail!("Got error code from daemon: {} {}", resp.status(), resp.body());
    }

    serde_json::from_str(resp.body()).context("Unable to parse response")

} 

pub fn uuid_from_name(name: &str, config: &CliOptions) -> Option<Uuid> {
    let plugins = match get_plugin_list(config, "") {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Couldn't get plugin list");
            if config.verbose() > 0 {
                eprintln!("Error: {e}");
            }
            return None
        }
    };

    plugins.into_iter().find_map(|(uuid, pm)| {
        if pm.short_name() == name {
            Some(uuid)
        } else {
            None
        }
    })

}
