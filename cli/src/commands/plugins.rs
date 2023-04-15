
use std::collections::HashMap;
use std::fmt::Write;
use std::io::Read;
use std::path::Path;

use hyper::{Method, StatusCode, Body};

use anyhow::{Result, Context};
use modnsd::config::MutableConfigValue;
use serde_json::Value;
use tokio_util::codec::{FramedRead, BytesCodec};

use crate::CliOptions;
use crate::util::{make_request, get_plugin_list, uuid_from_name};

pub fn list_plugins(config: &CliOptions, all: bool) -> Result<()> {

    let mut filter = String::new();

    if !all {
        filter.write_str("enabled=true")?;
    }

    let metadata = get_plugin_list(config, &filter).context("Failed to get plugin metadata")?;

    if config.verbose() > 2 {
        println!("{:#?}", metadata.iter());
        return Ok(());
    }

    if config.verbose() == 0 {
        for (_, plugin) in metadata.iter() {
            println!("{}{}", plugin.short_name(), if !plugin.enabled() {" [disabled]"} else {""})
        }

        return Ok(())
    }

    println!("Plugins:");
    println!("=========================");
    for (id, plugin) in metadata.iter() {
        println!();
        println!("`{}`", plugin.short_name());
        println!("Name: {}", plugin.friendly_name());
        println!("UUID: {}", id);
        if !plugin.enabled() {
            println!("Disabled");
        } else if config.verbose() > 1 {
            println!("Enabled");
        }

        if config.verbose() > 1 {
            println!();
            println!("Home directory on server: {}", plugin.home().display());
            print!("Modules: ");
            if plugin.is_listener() {
                print!("Listener ");
            }
            if plugin.is_interceptor() {
                print!("Interceptor ");
            }
            if plugin.is_resolver() {
                print!("Resolver ");
            }
            if plugin.is_validator() {
                print!("Validator ");
            }
            if plugin.is_inspector() {
                print!("Inspector");
            }
            println!();

            if let Some(pos) = plugin.intercept_position() {
                println!("Intercept Position: {pos}");
            }
        }
        println!();
        println!("{}", plugin.description().replace(r"\n", "\n"));
        println!();
        println!("=========================");
    };

    Ok(())
}

pub fn set_enabled(name: &str, enabled: bool, config: &CliOptions) -> Result<()> {

    let uuid = uuid_from_name(name, config).with_context(|| format!("Couldn't get UUID for `{name}`"))?;

    let resp = make_request(Method::POST, &format!("/api/plugins/{}/enable?enable={enabled}", uuid.as_simple()), None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got error code from daemon: {} ({})", resp.status(), resp.body())
    }

    Ok(())

}

pub fn get_config(plugin: &str, keys: &[String], config: &CliOptions) -> Result<()> {

    let uuid = uuid_from_name(plugin, config)
        .with_context(|| format!("Couldn't get UUID for `{plugin}`"))?;

    let resp = make_request(Method::GET, &format!("/api/plugins/{}/config?{}", uuid.as_simple(), keys.join("&")), None, None, config)
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

    if config.verbose() == 0 {
        for (key, value) in values {
            println!("{} = {}", key, value.value())
        }
    }

    Ok(())
}

pub fn set_config(plugin: &str, key: &str, value: &str, config: &CliOptions) -> Result<()> {

    let uuid = uuid_from_name(plugin, config)
        .with_context(|| format!("Couldn't get UUID for `{plugin}`"))?
        .simple();

    let resp = make_request(Method::POST, &format!("/api/plugins/{uuid}/config?{key}={value}"), None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}

pub fn uninstall(plugin: &str, config: &CliOptions) -> Result<()> {

    let uuid = uuid_from_name(plugin, config)
        .with_context(|| format!("Couldn't get UUID for `{plugin}`"))?
        .simple();

    let resp = make_request(Method::POST, &format!("/api/plugins/{uuid}/uninstall"), None, None, config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}

pub fn install(local_path: impl AsRef<Path>, config: &CliOptions) -> Result<()> {

    let local_path = local_path.as_ref().canonicalize()
        .context(format!("Couldn't find `{}`", local_path.as_ref().display()))?;

    if !local_path.is_file() {
        anyhow::bail!("`{}` is not a file", local_path.display())
    }

    let mut file = std::fs::File::open(local_path)
        .context("Couldn't open archive")?;

    let mut magic = [0u8; 262];
    file.read_exact(&mut magic)
        .context("Couldn't read from archive")?;

    let file_type = infer::get(&magic)
        .context("Couldn't infer filetype of archive")?;

    if !(infer::archive::is_tar(&magic) || infer::archive::is_zip(&magic)) {
        anyhow::bail!("file is not a zip or tar.gz archive (is {})", file_type.mime_type())
    }

    let file_len = file.metadata()
        .context("Couldn't get archive metadata")?
        .len()
        .to_string();

    let req_headers = vec![
        ("Content-Type", file_type.mime_type()),
        ("Content-Length", &file_len)
    ];

    let file = tokio::fs::File::from_std(file);

    let stream = FramedRead::new(file, BytesCodec::new());

    let req_body = Body::wrap_stream(stream);

    let resp = make_request(Method::PUT, "/api/plugins/install", Some(req_body), Some(req_headers), config)
        .context("Failed to send request to server")?;

    if resp.status() != StatusCode::CREATED {
        anyhow::bail!("Got unexpected error code from daemon: {} ({})", resp.status(), resp.body());
    };

    Ok(())
}
