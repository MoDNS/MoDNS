use std::path::Path;

use axum::{Router, routing::get_service};
use tower_http::services::{ServeDir, ServeFile};


pub fn spa_router(fs_path: impl AsRef<Path>) -> Router {
    Router::new()
        .nest_service(
            "/manage",
            get_service(ServeDir::new(fs_path.as_ref()))
        )
        .route_service(
            "/",
            get_service(ServeFile::new(fs_path.as_ref().join("index.html")))
        )
}
