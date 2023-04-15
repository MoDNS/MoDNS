
use crate::{CliOptions, util::make_request};

use anyhow::{Result, Context};
use hyper::{StatusCode, Method};

pub mod plugins;

pub fn get_config(keys: &[String], config: &CliOptions) -> Result<()> {

    let resp = make_request(Method::GET, &format!("/api/server/config?{}", keys.join("&")), None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got error code from daemon: {} ({})", resp.status(), resp.body());
    };

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
