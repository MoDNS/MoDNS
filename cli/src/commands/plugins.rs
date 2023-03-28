
use std::collections::HashMap;

use hyper::{Method, StatusCode};

use modnsd::plugins::metadata::PluginMetadata;
use uuid::Uuid;

use crate::CLI;
use crate::util::make_request;

pub fn list_plugins(config: &CLI) {

    let resp = make_request(Method::GET, "/api/plugins", config);

    let body = match resp {
        Ok(r) if r.status() == StatusCode::OK => {
            r.body().to_owned()
        },
        Ok(r) => {
            eprintln!("Got error code from daemon: {}", r.status());
            if !r.body().is_empty() {
                eprintln!("{}", r.body());
            }
            return
        },
        Err(e) => {
            eprintln!("Unable to send request: {:?}", e);
            return
        },
    };

    let metadata: HashMap<Uuid, PluginMetadata> = match serde_json::from_str(&body) {
        Ok(m) => m,
        Err(e) => {
            eprintln!("Unable to parse response: {e}");
            return
        },
    };

    println!("{:#?}", metadata.iter())
}
