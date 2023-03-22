
use std::convert::Infallible;
use std::sync::Arc;
use serde_derive::{Deserialize, Serialize};
use metadata::*;
use tokio::sync::RwLock;
use warp::sse::Event;
use warp::{Filter, filters::BoxedFilter, Reply, Rejection, Method, reject};
use warp::http::Uri;

use crate::plugins::manager::PluginManager;

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

pub fn route(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<impl Reply,>
{

}

pub fn uninstall_plugin() -> BoxedFilter<impl Reply,>
{
    warp::path!("api" / "plugins" / "uninstall")
}

pub fn api_plugins(pm: Arc<RwLock<PluginManager>>) -> BoxedFilter<(impl Reply,)>
{
    warp::path!("api" / "plugins").end().and(warp::query::<PluginQuery>()).map(|q: PluginQuery| {
        let metadata = pm.clone().read().await.list_metadata().into_iter().filter(|p| { p.0 == uuid }).collect();
    }).boxed()
}



fn get_plugins(q: PluginQuery) -> Result<Event, Infallible>
{
    let plug_list = String::from("Test");
    Ok(warp::sse::Event::default().data(plug_list))
}