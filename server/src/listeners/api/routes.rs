
use std::collections::BTreeMap;
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use uuid::Uuid;
use warp::reply::json;
use warp::{Filter, filters::BoxedFilter, Reply};
use warp::http::Uri;

use crate::plugins::manager::PluginManager;
use crate::plugins::response::ApiResponse;

#[derive(Deserialize)]
pub struct PluginQuery
{
    module: Option<String>,
    enabled: Option<bool>
}

#[derive(Deserialize)]
pub struct EnableQuery
{
    enable: Option<bool>
}

pub fn root_redirect() -> BoxedFilter<(impl Reply,)> {
    warp::path::end().map(|| warp::redirect(Uri::from_static("/manage"))).boxed()
}

pub fn frontend_filter() -> BoxedFilter<(impl Reply,)> {
    warp::path("manage").and(warp::fs::dir("./web")).boxed()
}

pub fn api_filter(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<(impl Reply,)> {
    let metadata_pm = pm.clone();
    let enable_pm = pm.clone();
    warp::path("api")
        .and(warp::path!("plugins").and(warp::query::<PluginQuery>())
        .then(move |pq: PluginQuery| {
            let pm = metadata_pm.clone();
            log::trace!("Plugin metadata list requested");
            get_metadata_list(pm, pq)
        })
        .or(warp::path!("plugins" / Uuid / "enable").and(warp::query::<EnableQuery>())
        .then(move |uuid: Uuid, eq: EnableQuery| {
            let pm = enable_pm.clone();
            log::trace!("Plugin enabled status change requested");
            set_plugin_stat(pm, uuid, eq)
            })
        )
        .or(warp::path!("server" / "restart")
        .then(|| {
            server_restart()
        })
        )
        .or(warp::path!("server" / "shutdown")
        .then(|| {
            server_shutdown()
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

pub async fn set_plugin_stat(pm: Arc<RwLock<PluginManager>>, uuid: Uuid, query: EnableQuery) -> impl Reply {

    let mut manager = pm.write().await;

    let (resp, word) = if query.enable.unwrap_or(true) {
        (manager.enable_plugin(&uuid), "enabled")
    } else {
        (manager.disable_plugin(&uuid), "disabled")
    };

    match resp {
        Ok(_) => ApiResponse::new(200, format!("Plugin {uuid} {word}")),
        Err(e) => ApiResponse::from(e),

    }
}

pub async fn server_shutdown() -> impl Reply {

   ApiResponse::new(200, format!("You tried to shutdown the server 👍"))

}

pub async fn server_restart() -> impl Reply {

    ApiResponse::new(200, format!("You tried to restart the server 👍"))

}
