
use std::path::{Path, PathBuf};
use std::collections::BTreeMap;
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use uuid::Uuid;
use warp::reply::json;
use warp::{Filter, filters::BoxedFilter, Reply};
use warp::http::Uri;

use crate::config::MutableConfigValue;
use crate::plugins::manager::PluginManager;
use crate::plugins::response::ApiResponse;

#[derive(Deserialize)]
pub struct PluginQuery
{
    module: Option<String>,
    enabled: Option<bool>
}

#[derive(Deserialize)]
pub struct ConfigGetQuery
{
    key: Option<String>,
}

#[derive(Deserialize)]
pub struct ConfigSetQuery
{
    key: Option<String>,
    value: Option<bool>
}

pub fn root_redirect() -> BoxedFilter<(impl Reply,)> {
    warp::path::end().map(|| warp::redirect(Uri::from_static("/manage"))).boxed()
}

pub fn frontend_filter(path: &Path, disable: bool) -> BoxedFilter<(impl Reply,)> {
    warp::path("manage")
        .and_then(move || async move {
            if !disable{
                Ok(())
            } else {
                log::trace!("Rejected request because headless mode is enabled");
                Err(warp::reject())
            }
        })
        .untuple_one()
        .and(warp::fs::dir(path.to_owned()))
        .boxed()
}

pub fn api_filter(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<(impl Reply,)> {
    let metadata_pm = pm.clone();
    let enable_pm = pm.clone();
    let disable_pm = pm.clone();
    let config_set_pm = pm.clone();
    let config_get_pm = pm.clone();
    // let intercept_pm = pm.clone();

    warp::path("api")
        .and(warp::path!("plugins").and(warp::query::<PluginQuery>())
        .then(move |pq: PluginQuery| {
            let pm = metadata_pm.clone();
            log::trace!("Plugin metadata list requested");
            get_metadata_list(pm, pq)
        })
        .or(warp::path!("plugins" / Uuid / "enable")
        .then(move |uuid: Uuid| {
            let pm = enable_pm.clone();
            log::trace!("Plugin enabled status change requested");
            set_plugin_stat(pm, uuid, true)
            })
        )
        .or(warp::path!("plugins" / Uuid / "disable")
        .then(move |uuid: Uuid| {
            let pm = disable_pm.clone();
            log::trace!("Plugin enabled status change requested");
            set_plugin_stat(pm, uuid, false)
            })
        )
        // .or(warp::path!("plugins" / "interceptorder")
        // .then(move || {
        //     let pm = intercept_pm.clone();
        //     log::trace!("Plugin intercept order requested");
        //     // set_plugin_stat(pm, uuid, false)
        //     })
        // )
        .or(warp::path!("server" / "config").and(warp::query::<ConfigGetQuery>()).and(warp::get())
        .then(move |cq: ConfigGetQuery| {
            let pm = config_get_pm.clone();
            log::trace!("Server config requested");
            get_server_config(pm, cq)
            })
        )
        .or(warp::path!("server" / "config").and(warp::query::<ConfigSetQuery>()).and(warp::post())
        .then(move |cq: ConfigSetQuery| {
            let pm = config_set_pm.clone();
            log::trace!("Server config requested");
            set_server_config(pm, cq)
            })
        )
    ).boxed()
}

pub async fn get_metadata_list(pm: Arc<RwLock<PluginManager>>, query: PluginQuery) -> Box<dyn Reply> {
    let metadata = pm.read().await.list_metadata();

    let reply = metadata.iter().filter(|(_, plugin)| {
        let matches_module = if let Some(mod_str) = &query.module {
            match mod_str.as_ref() {
                "listener" => plugin.is_listener(),
                "interceptor" => plugin.is_interceptor(),
                "resolver" => plugin.is_resolver(),
                "validator" => plugin.is_validator(),
                "inspector" => plugin.is_inspector(),
                _ => true
            }
        } else { true };

        let matches_enabled = query.enabled
        .and_then(|e| Some(e && plugin.enabled()))
        .unwrap_or(true);

        matches_module && matches_enabled
    }).collect::<BTreeMap<_, _>>();

    let json = json(&reply);

    Box::new(json)
}

pub async fn set_plugin_stat(pm: Arc<RwLock<PluginManager>>, uuid: Uuid, enable: bool) -> impl Reply {

    let mut manager = pm.write().await;

    let (resp, word) = if enable {
        (manager.enable_plugin(&uuid), "enabled")
    } else {
        (manager.disable_plugin(&uuid), "disabled")
    };

    match resp {
        Ok(_) => ApiResponse::new(200, format!("Plugin {uuid} {word}")),
        Err(e) => ApiResponse::from(e),

    }
}

pub async fn set_server_config(pm: Arc<RwLock<PluginManager>>, cq: ConfigSetQuery) -> Box<dyn Reply> {
    
    let cm = pm.write().await;

    let key = cq.key;
    let val = cq.value;

    cm.config().db_info();

    let resp: BTreeMap<String, String> = BTreeMap::new();

    match key.unwrap().as_ref() {
        "static_ip" => {},
        "use_static_ip" => {},
        "use_global_dashboard" => {},
        "plugin_paths" => {},
        "log_filter" => {},
        "database_type" => {},
        "sqlite_file_path" => {},
        "postgres_ip" => {},
        "postgres_port" => {},
        "sqlite_password" => {},
        "postgres_password" => {},
        &_ => {
            val.unwrap();
        },
    }

    let json = json(&resp);

    Box::new(json)
}

pub async fn get_server_config(pm: Arc<RwLock<PluginManager>>, cq: ConfigGetQuery) -> Box<dyn Reply> {
    
    let cm = pm.write().await;

    let mut reply = json(&());

    match cq.key.unwrap().as_ref() {
        "static_ip" => {},
        "use_static_ip" => {},
        "use_global_dashboard" => {},
        "plugin_paths" => {
            let path = cm.config().query_plugin_path();
            let mut resp: BTreeMap<&str, Vec<MutableConfigValue<PathBuf>>> = BTreeMap::new();
            resp.insert("data", path);
            reply = json(&resp);
        },
        "log_filter" => {
            let log = cm.config().query_log();
            reply = json(&log);
        },
        "database_type" => {
            let db_type = cm.config().query_db_type();
            reply = json(&db_type);
        },
        "sqlite_file_path" => {
            let db_path = cm.config().query_db_path();
            reply = json(&db_path);
        },
        "postgres_ip" => {
            let db_ip = cm.config().query_db_addr();
            reply = json(&db_ip);            
        },
        "postgres_port" => {
            let db_port = cm.config().query_db_port();
            reply = json(&db_port);            
        },
        "sqlite_password" => {
            let db_pass = cm.config().query_admin_pw();
            reply = json(&db_pass);
        },
        "postgres_password" => {
            let db_pass = cm.config().query_plugin_path();
            reply = json(&db_pass);            
        },
        "all" => {
            // let db_type = cm.config().query_db_type();
            // let db_pass = cm.config().query_plugin_path();
            // let db_port = cm.config().query_db_port();
            // let db_ip = cm.config().query_db_addr();
            // let db_path = cm.config().query_db_path();

            // json = json(&db_ip, &db_pass, &db_port, &db_path)
            log::trace!("Sending all server configs");
            reply = json(&());
            
        }
        &_ => {
            log::trace!("Default catch-all response");
            reply = json(&());
        },
    }

    Box::new(reply)
}

// pub async fn get_intercept_order(pm: Arc<RwLock<PluginManager>>) -> impl Reply {
    
// }

