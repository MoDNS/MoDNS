use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use super::executors::PluginManager;

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginMetadata {

    /// The plugin's unique ID
    /// 
    /// Used to reference the plugin for subsequent calls
    uuid: Uuid,

    /// The plugin's display-friendly name, set in their manifest.yaml
    friendly_name: String,

    /// The plugin's long description, set in their manifest.yaml
    description: String,

    /// The plugin's home directory on the server filesystem
    home: PathBuf,

    /// Is the plugin a listener
    is_listener: bool,

    /// Is the plugin an interceptor
    is_interceptor: bool,

    /// Is the plugin a resolver
    is_resolver: bool,
    
    /// Is the plugin a validator
    is_validator: bool,

    /// Is the plugin an inspector
    is_inspector: bool,

    /// If the plugin is an interceptor, its position in the
    /// interceptor query order
    intercept_position: Option<u16>,

    /// Is the plugin enabled presently
    enabled: bool
}

impl PluginManager {
    pub fn list_metadata(&self) -> Vec<PluginMetadata> {
        self.plugins().iter().map(|(uuid, plugin)| {

            PluginMetadata {
                uuid: uuid.clone(),
                friendly_name: "friendly_name is not implemented".into(),
                description: "description is not implemented".into(),
                home: plugin.home_dir().into(),
                is_listener: plugin.is_listener(),
                is_interceptor: false,
                is_resolver: plugin.is_resolver(),
                is_validator: false,
                is_inspector: false,
                intercept_position: None,
                enabled: plugin.enabled(),
            }
        }).collect()
    }
}