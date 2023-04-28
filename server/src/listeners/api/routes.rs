
use std::path::Path;
use std::collections::BTreeMap;
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use uuid::Uuid;
use warp::Rejection;
use warp::reply::json;
use warp::{Filter, filters::BoxedFilter, Reply};
use warp::http::Uri;

use crate::config::{PLUGIN_PATH_KEY, USE_GLOBAL_DASH_KEY, LOG_KEY, DB_TYPE_KEY, DB_PATH_KEY, DB_ADDR_KEY, DB_PASS_KEY, ADMIN_PW_KEY, DB_PORT_KEY, ALL_KEY};
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
    key: String,
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
    // let favicon_pm = pm.clone();
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
        USE_GLOBAL_DASH_KEY => {},
        PLUGIN_PATH_KEY => {},
        LOG_KEY => {},
        DB_TYPE_KEY => {},
        DB_PATH_KEY => {},
        DB_ADDR_KEY => {},
        DB_PORT_KEY => {},
        DB_PASS_KEY => {},
        ADMIN_PW_KEY => {},
        &_ => {
            val.unwrap();
        },
    }

    let json = json(&resp);

    Box::new(json)
}

pub async fn get_server_config(pm: Arc<RwLock<PluginManager>>, cq: ConfigGetQuery) -> Result<impl Reply, Rejection> {
    
    let cm = pm.write().await;

    let mut reply:BTreeMap<&str, serde_json::Value> = BTreeMap::new();
    let reject;
    let key = cq.key.as_ref();

    match key {
        USE_GLOBAL_DASH_KEY => {
            let bool = cm.config().query_use_global_dash();
            let Ok(value) = serde_json::to_value(bool) else {
                return Err(warp::reject())
            };

            reply.insert(key, value);
        },
        PLUGIN_PATH_KEY => {
            let path = cm.config().query_plugin_path();
            let Ok(value) = serde_json::to_value(path) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        LOG_KEY => {
            let log = cm.config().query_log();
            let Ok(value) = serde_json::to_value(log) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        DB_TYPE_KEY => {
            let db_type = cm.config().query_db_type();
            let Ok(value) = serde_json::to_value(db_type) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        DB_PATH_KEY => {
            let db_path = cm.config().query_db_path();
            let Ok(value) = serde_json::to_value(db_path) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        DB_ADDR_KEY => {
            let db_ip = cm.config().query_db_addr();
            let Ok(value) = serde_json::to_value(db_ip) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);           
        },
        DB_PORT_KEY => {
            let db_port = cm.config().query_db_port();
            let Ok(value) = serde_json::to_value(db_port) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        DB_PASS_KEY => {
            let db_pass = cm.config().query_admin_pw();
            let Ok(value) = serde_json::to_value(db_pass) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        ADMIN_PW_KEY => {
            let admin_pass = cm.config().query_plugin_path();
            let Ok(value) = serde_json::to_value(admin_pass) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);
        },
        ALL_KEY => {
            let db_type = cm.config().query_db_type();
            let Ok(value) = serde_json::to_value(db_type) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);

            let db_pass = cm.config().query_plugin_path();
            let Ok(value) = serde_json::to_value(db_pass) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);

            let db_port = cm.config().query_db_port();
            let Ok(value) = serde_json::to_value(db_port) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);

            let db_ip = cm.config().query_db_addr();
            let Ok(value) = serde_json::to_value(db_ip) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);

            let db_path = cm.config().query_db_path();
            let Ok(value) = serde_json::to_value(db_path) else {
                return Err(warp::reject())
            };
            reply.insert(key, value);

            log::trace!("Sending all server configs");
            
        },
        &_ => {
            reject = warp::reject();
        },
    }

    if reply.is_empty() {
        Err(warp::reject())
    } else {
        Ok(Box::new(json(&reply)))
    }

}

