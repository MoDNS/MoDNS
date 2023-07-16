use std::sync::Arc;

use axum::Router;
use tokio::sync::RwLock;

use crate::PluginManager;


pub fn router(state: Arc<RwLock<PluginManager>>) -> Router {
    Router::new()
        .with_state(state)
}
