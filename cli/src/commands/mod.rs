
use std::collections::HashMap;

use crate::{CliOptions, util::make_request};

use anyhow::{Result, Context};
use hyper::{StatusCode, Method};
use modnsd::config::MutableConfigValue;
use serde_json::Value;

pub mod plugins;

pub fn get_config(keys: &[String], config: &CliOptions) -> Result<()> {

    let resp = make_request(Method::GET, &format!("/api/server/config?{}", keys.join("&")), None, None, config)
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

    let values: HashMap<String, MutableConfigValue<Value>> = serde_json::from_str(resp.body())
        .context("Couldn't decode server response")?;

    for (key, value) in values {
        println!("{} = {}{}", key, value.value(), if value.is_overridden() {"*"} else {""})
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

    let resp = make_request(Method::POST, "/api/server/restart", None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}
