
use std::collections::HashMap;

use hyper::{Method, StatusCode};

use modnsd::plugins::metadata::PluginMetadata;
use uuid::Uuid;

use crate::CliOptions;
use crate::util::make_request;

pub fn list_plugins(config: &CliOptions) {

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
            if config.verbose() > 0 {
                eprintln!("Unable to send request: {e:?}");
            } else {
                eprintln!("Unable to send request: {e}");
            }
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

    if config.verbose() > 2 {
        println!("{:#?}", metadata.iter());
        return
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
    }
}

pub fn set_enabled(uuid: &Uuid, enabled: bool, config: &CliOptions) {
    let resp = make_request(Method::POST, &format!("/api/plugins/enable?uuid={}&enable={enabled}", uuid.as_simple()), config);

    match resp {
        Ok(r) if r.status() == StatusCode::OK => {
            return
        },
        Ok(r) => {
            eprintln!("Got error code from daemon: {}", r.status());
            if !r.body().is_empty() {
                eprintln!("{}", r.body());
            }
            return
        },
        Err(e) => {
            if config.verbose() > 0{
                eprintln!("Unable to send request: {e:?}");
            } else {
                eprintln!("Unable to send request: {e}")
            }
            return
        },
    };

}
