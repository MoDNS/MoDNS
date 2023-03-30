use std::{path::PathBuf, collections::BTreeMap};
use anyhow::{Context, Result};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

use super::manager::PluginManager;
use super::plugin::DnsPlugin;

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

impl PluginMetadata {
    pub fn enabled(&self) -> bool {
        self.enabled
    }
}

impl DnsPlugin {
    pub fn metadata(&self) -> PluginMetadata {
        PluginMetadata {
            friendly_name: self.friendly_name().to_owned(),
            description: self.description().to_owned(),
            home: self.home_dir().to_owned(),
            is_listener: self.is_listener(),
            is_interceptor: self.is_interceptor(),
            is_resolver: self.is_resolver(),
            is_validator: self.is_validator(),
            is_inspector: self.is_inspector(),
            intercept_position: None,
            enabled: self.enabled(),
        }
    }
}

impl PluginManager {
    pub fn list_metadata(&self) -> BTreeMap<Uuid, PluginMetadata> {
        self.plugins().iter().map(|(id, p)| {
            (id.clone(), p.metadata())
        }).collect()
    }

    pub fn get_metadata(&self, id: &Uuid) -> Result<PluginMetadata> {
        Ok(self.plugins().get(id)
            .context("Plugin with uuid {id} was not found")?
            .metadata())
    }
}
