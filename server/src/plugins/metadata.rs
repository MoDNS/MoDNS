use std::{path::PathBuf, collections::BTreeMap};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use super::executors::{PluginManager, DnsPlugin};

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginMetadata {

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

impl DnsPlugin {
    pub fn metadata(&self) -> PluginMetadata {
        PluginMetadata {
            friendly_name: "friendly_name isn't implemented yet".to_owned(),
            description: "description isn't implemented yet".to_owned(),
            home: self.home_dir().to_owned(),
            is_listener: self.is_listener(),
            is_interceptor: false, // Not implemented
            is_resolver: self.is_resolver(), // Not implemented
            is_validator: false, // Not implemented
            is_inspector: false, // Not implemented
            intercept_position: None,
            enabled: self.enabled(),
        }
    }
}

impl PluginManager {
    pub fn list_metadata(&self) -> BTreeMap<Uuid, PluginMetadata> {
        let mut metadata_map = BTreeMap::new();

        for (id, p) in self.plugins().iter() {
            metadata_map.insert(id.clone(), p.metadata());
        };

        metadata_map
    }
}