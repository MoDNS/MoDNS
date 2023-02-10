
pub mod listeners;
pub mod plugins;

pub type ErrorBox = Box<dyn std::error::Error + Sync + Send>;