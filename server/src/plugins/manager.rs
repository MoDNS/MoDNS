
use std::path::{PathBuf, Path};
use std::sync::{Arc, Weak};
use std::collections::BTreeMap;

use anyhow::{Context, Result};
use modns_sdk::ffi;
use uuid::Uuid;

use super::plugin::{DnsPlugin, PluginExecutorError};

pub struct PluginManager {
    plugins: BTreeMap<uuid::Uuid, Arc<DnsPlugin>>,
    listener: Weak<DnsPlugin>,
    resolver: Weak<DnsPlugin>
}

impl PluginManager {
    pub fn new() -> Self {
        Self {
            plugins: BTreeMap::new(),
            listener: Weak::new(),
            resolver: Weak::new()
        }
    }

    pub fn load<P: AsRef<Path>>(&mut self, dir_path: P, enable: bool) -> Result<()> {
        let id = Uuid::new_v4();

        let dir = PathBuf::from(dir_path.as_ref()).canonicalize().context("Couldn't canonicalize plugin path")?;

        let plugin = Arc::new(DnsPlugin::load(&dir, enable)?);

        log::info!("Loaded plugin `{}` from directory {}", plugin.friendly_name(), dir.display());

        log::trace!("Metadata for `{}`:\n{:#?}", plugin.friendly_name(), plugin.metadata());

        self.plugins.insert( id, plugin);

        Ok(())
    }

    pub fn search(&mut self, search_path: &[PathBuf]) -> Result<()>{
        for parent in search_path {
            let parent = parent.canonicalize()
            .with_context(|| format!("Couldn't canonicalize search path {}", parent.display()))?;

            log::debug!("Searching {} for plugins", parent.display());

            match parent.read_dir() {
                Ok(dir_info) => {
                    let dirs = dir_info.filter_map(|d| {
                        match d {
                            Ok(f) if f.file_type().ok()?.is_dir()=> Some(f.path()),
                            Ok(_) => None,
                            Err(e) => {
                                log::warn!("Failed to read a subdirectory of {}: {e}", parent.display());
                                None
                            },
                        }
                    });

                    for subdir in dirs {
                        log::trace!("Checking {}", subdir.display());

                        let so_path = subdir.join("plugin.so");

                        if !so_path.is_file() { continue; }

                        if let Err(e) = self.load(subdir, false) {
                            log::error!("Failed to load library at {}: {e:?}", so_path.display())
                        }
                    }
                },

                Err(e) => {
                    log::info!("Failed to read directory {}: {}", parent.display(), e);
                },
            }
        }

        self.init()
    }

    pub fn init(&mut self) -> Result<()> {
        self.listener = match self.plugins.values().find(|p| p.is_listener()) {
            Some(p) => Arc::downgrade(p),
            None => Weak::new(),
        };

        self.resolver = match self.plugins.values().find(|p| p.is_resolver()) {
            Some(p) => Arc::downgrade(p),
            None => Weak::new(),
        };

        log::trace!("Plugin Manager initialized with: {:#?}", self.list_metadata());

        Ok(())
    }

    /// Validate the [PluginManager] by checking that it has the
    /// minimum number of enabled plugins to resolve DNS requests
    /// (i.e. at least a Listener & Resolver)
    /// 
    pub fn validate(&self, return_err: bool) -> Result<()> {
        let missing_listener = self.listener.strong_count() == 0;
        let missing_resolver = self.resolver.strong_count() == 0;

        if missing_listener {
            log::warn!("No listener is enabled, server will be unable to handle DNS requests");
        };

        if missing_resolver {
            log::warn!("No resolver is enabled, server will be unable to handle DNS requests");
        }

        if (missing_listener || missing_resolver) && return_err {
            anyhow::bail!("Missing a required plugin");
        };

        anyhow::Ok(())
    }

    pub fn decode(&self, req: &[u8]) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {
        self.listener.upgrade()
        .ok_or(PluginExecutorError::NoneEnabled)?
        .decode(req)
    }

    pub fn encode(&self, message: Box<ffi::DnsMessage>) -> Result<Vec<i8>, PluginExecutorError> {
        self.listener.upgrade()
        .ok_or(PluginExecutorError::NoneEnabled)?
        .encode(message)
    }

    pub fn resolve(&self, request: Box<ffi::DnsMessage>) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {
        self.resolver.upgrade()
        .ok_or(PluginExecutorError::NoneEnabled)?
        .resolve(request)
    }

    pub fn plugins(&self) -> &BTreeMap<uuid::Uuid, Arc<DnsPlugin>> {
        &self.plugins
    }
}