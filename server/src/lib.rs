
pub mod listeners;
pub mod plugins;
pub mod config;

pub use config::ServerConfig;

pub use plugins::manager::PluginManager;

pub type ErrorBox = Box<dyn std::error::Error + Sync + Send>;
