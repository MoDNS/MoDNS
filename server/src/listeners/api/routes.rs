
use std::convert::Infallible;
use std::sync::Arc;
use serde::Deserialize;
use tokio::sync::RwLock;
use warp::reply::json;
use warp::sse::Event;
use warp::{Filter, filters::BoxedFilter, Reply, Rejection, reject};
use warp::http::Uri;

use crate::plugins::manager::PluginManager;

#[derive(Deserialize)]
struct PluginQuery
{
    uuid: Option<String>,
    enabled: bool,
    module: Option<String>,
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
        .and(warp::path!("plugins")
            .then(move || {
            let pm = metadata_pm.clone();
            get_metadata_list(pm)
            })
        )
    .boxed()
}

// pub fn route(pm: Arc<RwLock<PluginManager>>) -> String
// {
//     todo!()
// }

// pub fn uninstall_plugin() -> String
// {
//     warp::path!("api" / "plugins" / "uninstall");
//     todo!()
// }

// pub async fn api_plugins(pm: Arc<RwLock<PluginManager>>) -> impl Filter
// {
//     let pm = pm.clone();
//     warp::path!("api" / "plugins").and(warp::query::<PluginQuery>()).then(move |q| {
//         let pm = pm.clone();
        
//         async move {
//         pm.read().await.list_metadata().iter()
//         .map(|(_, p)| json(p)).collect::<Vec<_>>()
//     }})
// }

pub async fn get_metadata_list(pm: Arc<RwLock<PluginManager>>) -> impl Reply {
    let metadata = pm.read().await.list_metadata().into_iter()
    .map(|(_, p)| p).collect::<Vec<_>>();

    json(&metadata)
}



fn get_plugins(q: PluginQuery) -> Result<Event, Infallible>
{
    let plug_list = String::from("Test");
    Ok(warp::sse::Event::default().data(plug_list))
}