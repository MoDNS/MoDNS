
use std::net::{IpAddr, Ipv4Addr};
use std::path::{Path, PathBuf};
use std::collections::{BTreeMap, HashMap};
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use uuid::Uuid;
use warp::reply::json;
use warp::{Filter, filters::BoxedFilter, Reply};
use warp::http::Uri;

use crate::config::{PLUGIN_PATH_KEY, LOG_KEY, DB_TYPE_KEY, DB_PATH_KEY, DB_ADDR_KEY, DB_PASS_KEY, ADMIN_PW_KEY, DB_PORT_KEY, ALL_KEY, DB_USER_KEY, DatabaseBackend, HTTPS_KEY, TLS_CERT_KEY, TLS_KEY_KEY, API_PORT_KEY};
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
    keys: Option<String>
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
        .and(warp::fs::dir(path.to_owned()).or(warp::fs::file(path.join(path.join("index.html")))))
        .boxed()
}

pub fn api_filter(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<(impl Reply,)> {
    let metadata_pm = pm.clone();
    let enable_pm = pm.clone();
    let disable_pm = pm.clone();
    let config_set_pm = pm.clone();
    let config_get_pm = pm.clone();

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
        .or(warp::path!("server" / "config").and(warp::get()).and(warp::query::<ConfigGetQuery>())
        .then(move |cq: ConfigGetQuery| {
            let pm = config_get_pm.clone();
            let vec = cq.keys.unwrap_or("".to_string()).split(',').map(str::to_string).collect::<Vec<String>>();
            log::trace!("Server config requested");
            get_server_config(pm, vec)
            })
        )
        .or(warp::path!("server" / "config").and(warp::post()).and(warp::filters::body::json())
        .then(move |json: HashMap<String, serde_json::Value>| {
            let pm = config_set_pm.clone();
            log::trace!("Server config requested");
            set_server_config(pm, json)
            })
        )
    ).boxed()
}

pub async fn get_metadata_list(pm: Arc<RwLock<PluginManager>>, query: PluginQuery) -> impl Reply {
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

    Ok(Box::new(json))
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

pub async fn set_server_config(pm: Arc<RwLock<PluginManager>>, json: HashMap<String, serde_json::Value>) -> impl Reply {
    
    let mut cm = pm.write().await;

    if json.is_empty()
    {
        return ApiResponse::new(404, format!("No key found..."))
    }

    for i in json.into_iter() {
        match i.0.as_ref() {
            PLUGIN_PATH_KEY => {
                let vec = serde_json::from_value::<Vec<PathBuf>>(i.1).ok().unwrap_or(Vec::<PathBuf>::new());
                cm.config_mut().set_plugin_path(vec).ok();
            },
            LOG_KEY => {
                let log = i.1;
                cm.config_mut().set_log(serde_json::from_value(log).ok().unwrap_or("".to_string())).ok();
            },
            DB_TYPE_KEY => {
                let db_type = if i.1.to_string() == "Sqlite" {DatabaseBackend::Sqlite} else if i.1 == "Postgres" {DatabaseBackend::Postgres} else {DatabaseBackend::default()};
                cm.config_mut().set_db_type(db_type).ok();
            },
            DB_PATH_KEY => {
                let db_path = serde_json::from_value(i.1).ok().unwrap_or_default();
                cm.config_mut().set_db_path(db_path).ok();
            },
            DB_ADDR_KEY => {
                let db_addr = serde_json::from_value(i.1).ok().unwrap_or(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)));
                cm.config_mut().set_db_addr(db_addr).ok();
            },
            DB_PORT_KEY => {
                let db_port = serde_json::from_value(i.1).ok();
                cm.config_mut().set_db_port(db_port).ok();
            },
            DB_PASS_KEY => {
                let password = i.1.to_string().replace("\\\"", "");
                cm.config_mut().set_db_password(&password).ok();
            },
            DB_USER_KEY => {
                let user = i.1.to_string().replace("\\\"", "");
                cm.config_mut().set_db_user(&user).ok();
            },
            API_PORT_KEY => {
                let port = serde_json::from_value(i.1).ok();
                cm.config_mut().set_api_port(port).ok();
            },
            HTTPS_KEY => {
                let https = serde_json::from_value(i.1).ok();
                cm.config_mut().set_https(https).ok();
            },
            TLS_CERT_KEY => {
                let path = serde_json::from_value(i.1).ok();
                cm.config_mut().set_tls_key(path).ok();
            },
            TLS_KEY_KEY => {
                let path = serde_json::from_value(i.1).ok();
                cm.config_mut().set_tls_key(path).ok();
            }
            ADMIN_PW_KEY => {
                let pw = i.1.to_string();
                cm.config_mut().set_admin_pw_hash(pw.to_string()).ok();
            },
            &_ => {
                return ApiResponse::new(404, format!("{:#?} has an invalid key...", i.1))
            },
        }
    };

    ApiResponse::new(200, format!("Set server config"))

}

pub async fn get_server_config(pm: Arc<RwLock<PluginManager>>, vec: Vec<String>) -> impl Reply {
    
    let cm = pm.write().await;

    let mut reply:BTreeMap<String, serde_json::Value> = BTreeMap::new();
    
    for i in vec {
        match i.as_ref() {
            PLUGIN_PATH_KEY => {
                let path = cm.config().query_plugin_path();
                let Ok(value) = serde_json::to_value(path) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            LOG_KEY => {
                let log = cm.config().query_log();
                let Ok(value) = serde_json::to_value(log) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            DB_TYPE_KEY => {
                let db_type = cm.config().query_db_type();
                let Ok(value) = serde_json::to_value(db_type) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            DB_PATH_KEY => {
                let db_path = cm.config().query_db_path();
                let Ok(value) = serde_json::to_value(db_path) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            DB_ADDR_KEY => {
                let db_ip = cm.config().query_db_addr();
                let Ok(value) = serde_json::to_value(db_ip) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);           
            },
            DB_PORT_KEY => {
                let db_port = cm.config().query_db_port();
                let Ok(value) = serde_json::to_value(db_port) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            DB_USER_KEY => {
                let db_pass = cm.config().query_db_user();
                let Ok(value) = serde_json::to_value(db_pass) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            DB_PASS_KEY => {
                let db_pass = cm.config().query_admin_pw();
                let Ok(value) = serde_json::to_value(db_pass) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            ADMIN_PW_KEY => {
                let admin_pass = cm.config().query_plugin_path();
                let Ok(value) = serde_json::to_value(admin_pass) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            HTTPS_KEY => {
                let bool = cm.config().query_https();
                let Ok(value) = serde_json::to_value(bool) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            TLS_CERT_KEY => {
                let cert = cm.config().query_tls_cert();
                let Ok(value) = serde_json::to_value(cert) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            TLS_KEY_KEY => {
                let key = cm.config().query_tls_key();
                let Ok(value) = serde_json::to_value(key) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            API_PORT_KEY => {
                let port = cm.config().query_api_port();
                let Ok(value) = serde_json::to_value(port) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(i, value);
            },
            ALL_KEY => {
                let db_type = cm.config().query_db_type();
                let Ok(value) = serde_json::to_value(db_type) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(DB_TYPE_KEY.to_string(), value);
    
                let db_pass = cm.config().query_plugin_path();
                let Ok(value) = serde_json::to_value(db_pass) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(DB_PASS_KEY.to_string(), value);
    
                let db_port = cm.config().query_db_port();
                let Ok(value) = serde_json::to_value(db_port) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(DB_PORT_KEY.to_string(), value);
    
                let db_ip = cm.config().query_db_addr();
                let Ok(value) = serde_json::to_value(db_ip) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(DB_ADDR_KEY.to_string(), value);
    
                let db_path = cm.config().query_db_path();
                let Ok(value) = serde_json::to_value(db_path) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(DB_PATH_KEY.to_string(), value);

                let port = cm.config().query_api_port();
                let Ok(value) = serde_json::to_value(port) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(API_PORT_KEY.to_string(), value);

                let key = cm.config().query_tls_key();
                let Ok(value) = serde_json::to_value(key) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(TLS_KEY_KEY.to_string(), value);

                let cert = cm.config().query_tls_cert();
                let Ok(value) = serde_json::to_value(cert) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(TLS_CERT_KEY.to_string(), value);

                let bool = cm.config().query_https();
                let Ok(value) = serde_json::to_value(bool) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(HTTPS_KEY.to_string(), value);

                let admin_pass = cm.config().query_plugin_path();
                let Ok(value) = serde_json::to_value(admin_pass) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(ADMIN_PW_KEY.to_string(), value);

                let log = cm.config().query_log();
                let Ok(value) = serde_json::to_value(log) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(LOG_KEY.to_string(), value);

                let path = cm.config().query_plugin_path();
                let Ok(value) = serde_json::to_value(path) else {
                    return ApiResponse::new(404, format!("Key not found"))
                };
                reply.insert(PLUGIN_PATH_KEY.to_string(), value);

                log::trace!("Sending all server configs");

            },
            &_ => {
                return ApiResponse::new(404, format!("Key not found"))
            },
        }
    }


    if reply.is_empty() {
        return ApiResponse::new(404, format!("Key not found"))
    } else {
        return ApiResponse::new(200, serde_json::json!(&reply).to_string())
    }

}