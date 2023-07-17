
use axum::Router;

use crate::PluginManagerLock;

mod frontend;


pub fn router(state: PluginManagerLock) -> Router {
    Router::new()
        .with_state(state)
        .merge(frontend::spa_router("/usr/share/modns/web"))
}
