
use std::collections::BTreeMap;
use std::convert::Infallible;
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use uuid::Uuid;
use warp::reply::json;
use warp::sse::Event;
use warp::{Filter, filters::BoxedFilter, Reply, Rejection, reject};
use warp::http::Uri;

use crate::plugins::metadata::PluginMetadata;
use crate::plugins::manager::PluginManager;

#[derive(Deserialize)]
pub struct PluginQuery
{
    module: Option<String>,
    enabled: Option<bool>
}

pub fn root_redirect() -> BoxedFilter<(impl Reply,)> {
    warp::path::end().map(|| warp::redirect(Uri::from_static("/manage"))).boxed()
}

pub fn frontend_filter() -> BoxedFilter<(impl Reply,)> {
    warp::path("manage").and(warp::fs::dir("./web")).boxed()
}

pub fn api_filter(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<(impl Reply,)> {
    let metadata_pm = pm.clone();
    warp::path("api")
        .and(warp::path!("plugins").and(warp::query::<PluginQuery>())
            .then(move |pq: PluginQuery| {
            let pm = metadata_pm.clone();
            log::trace!("Plugin metadata list requested");
            get_metadata_list(pm, pq)
        })
        )
    .boxed()
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

    return json
}