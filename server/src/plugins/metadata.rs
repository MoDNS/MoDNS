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

    pub fn friendly_name(&self) -> &str {
        self.friendly_name.as_ref()
    }

    pub fn description(&self) -> &str {
        self.description.as_ref()
    }

    pub fn home(&self) -> &PathBuf {
        &self.home
    }

    pub fn is_listener(&self) -> bool {
        self.is_listener
    }

    pub fn is_interceptor(&self) -> bool {
        self.is_interceptor
    }

    pub fn is_resolver(&self) -> bool {
        self.is_resolver
    }

    pub fn is_validator(&self) -> bool {
        self.is_validator
    }

    pub fn is_inspector(&self) -> bool {
        self.is_inspector
    }

    pub fn intercept_position(&self) -> Option<u16> {
        self.intercept_position
    }

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
            is_interceptor: false, // Not implemented
            is_resolver: self.is_resolver(),
            is_validator: false, // Not implemented
            is_inspector: false, // Not implemented
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
