
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
    is_listener: bool,
    is_interceptor: bool,
    is_resolver: bool,
    is_validator: bool,
    is_inspector: bool,
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
            get_metadata_list(pm, pq.is_inspector, pq.is_interceptor, pq.is_listener, pq.is_resolver, pq.is_validator)
            })
        )
    .boxed()
}

pub async fn get_metadata_list(pm: Arc<RwLock<PluginManager>>, is_inspector: bool, is_interceptor: bool, is_listener: bool, is_resolver: bool, is_validator: bool) -> impl Reply {
    let metadata = pm.read().await.list_metadata();
    let mut reply: BTreeMap<Uuid, PluginMetadata> = BTreeMap::new();
    
    for plugin in metadata
    {
        let uuid = plugin.0;
        let data = pm.read().await.get_plugin_interceptor(&uuid);
        //log::trace!("{test:#?}");
        reply.insert(uuid, plugin.1);
    }
    
    // let test: Vec<PluginMetadata> = metadata.into_iter().map(|x| x.1 ).collect();
    // log::trace!("Testing plugin metadata: {test:#?}");
    // let test2 = 
    
    /*.into_iter().filter(|pm| {
        1 == 1
    }).collect::<BTreeMap<Uuid, PluginMetadata>>();*/
    
    //log::trace!("Sending plugin metadata: {metadata:#?}");
    
    let metadata = pm.read().await.list_metadata();

    let json = json(&metadata);

    return json
}



fn get_plugins(q: PluginQuery) -> Result<Event, Infallible>
{
    let plug_list = String::from("Test");
    Ok(warp::sse::Event::default().data(plug_list))
}