
use hyper::{Method, StatusCode};

use anyhow::{Result, Context};

use crate::CliOptions;
use crate::util::{make_request, get_plugin_list, uuid_from_name};

pub fn list_plugins(config: &CliOptions) -> Result<()> {

    let metadata = get_plugin_list(config).context("Failed to get plugin metadata")?;

    if config.verbose() > 2 {
        println!("{:#?}", metadata.iter());
        return Ok(());
    }

    println!("Plugins:");
    println!("=========================");
    for (id, plugin) in metadata.iter() {
        println!();
        println!("Name: {}", plugin.friendly_name());
        println!("UUID: {}", id);
        if !plugin.enabled() {
            println!("Disabled");
        } else if config.verbose() > 0 {
            println!("Enabled");
        }

        if config.verbose() > 0 {
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

    let resp = make_request(Method::POST, &format!("/api/plugins/enable?uuid={}&enable={enabled}", uuid.as_simple()), config)
        .context("Unable to send request")?;

    if resp.status() != StatusCode::OK {
        anyhow::bail!("Got error code from daemon: {} ({})", resp.status(), resp.body())
    }

    Ok(())

}
