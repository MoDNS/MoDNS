
pub mod listeners;
pub mod plugins;
pub mod config;
pub mod api;

pub use config::ServerConfig;

pub use plugins::manager::PluginManager;

/// Shorthand type for a `Arc<RwLock<PluginManager>>`, which
/// gets passed around quite often for state management
pub type PluginManagerLock = std::sync::Arc<tokio::sync::RwLock<PluginManager>>;

pub type ErrorBox = Box<dyn std::error::Error + Sync + Send>;
