
use std::collections::HashMap;

use crate::{CliOptions, util::make_request};

use anyhow::{Result, Context};
use hyper::{StatusCode, Method, Body};
use modnsd::config::MutableConfigValue;
use serde_json::Value;

pub mod plugins;

pub fn get_config(keys: &[String], config: &CliOptions) -> Result<()> {

    let body = Body::from(serde_json::to_string(keys)?);

    let resp = make_request(Method::GET, &format!("/api/server/config?keys={}", keys.join(",")), Some(body), None, config)
        .context("Unable to send request")?;

    if resp.status() == StatusCode::NOT_FOUND {
        anyhow::bail!(resp.body().to_owned())
    }

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got error code from daemon: {} ({})", resp.status(), resp.body());
    };

    if config.verbose() > 2 {
        eprintln!("Got response from server: {}", resp.body())
    }

    let values: HashMap<String, Value> = serde_json::from_str(resp.body())
        .context("Couldn't decode server response")?;

    for (key, value) in values {
        if let Ok(val) = serde_json::from_value::<MutableConfigValue<Value>>(value.clone()) {
            let s = serde_json::from_value::<String>(val.value().clone()).unwrap_or(val.value().to_string());
            println!("{} = {}{}", key, s, if val.is_overridden() {"*"} else {""})
        } else {
            let list = serde_json::from_value::<Vec<MutableConfigValue<Value>>>(value)
                .context(format!("Couldn't decode object `{key}`"))?;
            println!("{key} =");
            for item in list {
                let ov = if item.is_overridden() {"*"} else {" "};
                let s = serde_json::from_value::<String>(item.into_value())
                    .context("Failed to decode list item in object `{key}`")?;
                println!("  {ov} {s}");
            }
        }
    }

    Ok(())
}

pub fn set_config(key: &str, value: &str, config: &CliOptions) -> Result<()> {

    let resp = make_request(Method::POST, &format!("/api/server/config?{key}={value}"), None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}

pub fn restart(config: &CliOptions) -> Result<()> {

    let resp = make_request(Method::POST, "/api/server/restart", None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}

pub fn shutdown(config: &CliOptions) -> Result<()> {

    let resp = make_request(Method::POST, "/api/server/shutdown", None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}
