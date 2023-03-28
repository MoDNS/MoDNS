
use std::path::{PathBuf, Path};
use std::sync::{Arc, Weak};
use std::collections::BTreeMap;

use anyhow::{Context, Result, bail};
use modns_sdk::types::ffi;
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

    pub fn load<P: AsRef<Path>>(&mut self, dir_path: P, enable: bool) -> Result<Uuid> {
        let id = Uuid::new_v4();

        let dir = PathBuf::from(dir_path.as_ref()).canonicalize().context("Couldn't canonicalize plugin path")?;

        let plugin = Arc::new(DnsPlugin::load(&dir, enable)?);

        log::info!("Loaded plugin `{}` from directory {}", plugin.friendly_name(), dir.display());

        log::trace!("Metadata for `{}`:\n{:#?}", plugin.friendly_name(), plugin.metadata());

        self.plugins.insert( id, plugin);

        Ok(id)
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

        log::info!("Initializing Plugin Manager");

        if !self.has_listener() {

            log::info!("No listener was enabled, attempting to enable one");

            if let Some((id, _)) = self.plugins.iter().find(|(_, p)| p.is_listener()) {
                let id = id.clone();

                if let Err(e) = self.enable_plugin(&id) {
                    log::error!("Failed to enable a fallback listener plugin: {e}");
                }
            };
            
        }

        if !self.has_resolver() {

            log::info!("No resolver was enabled, attempting to enable one");

            if let Some((id, _)) = self.plugins.iter().find(|(_, p)| p.is_resolver()) {
                let id = id.clone();
                if let Err(e) = self.enable_plugin(&id) {
                    log::error!("Failed to enable a fallback resolver plugin: {e}");
                };
            };

        }

        log::trace!("PluginManager status after init: {:#?}", self.list_metadata());

        Ok(())
    }

    pub fn enable_plugin(&mut self, uuid: &Uuid) -> Result<()> {

        let plugin = self.plugins().get(uuid).context("Failed to get plugin with uuid {uuid}")?;

        if plugin.enabled() {
            bail!("Plugin is already enabled")
        }

        if plugin.is_listener() && self.has_listener() {
            self.disable_listener()?;
        }

        let plugin = self.plugins().get(uuid).context("Failed to get plugin with uuid {uuid}")?;

        if plugin.is_resolver() && self.has_resolver() {
            self.disable_resolver()?;
        }

        let plugin_mut = self.plugins.get_mut(uuid).context("Failed to get plugin with uuid {uuid}")?;

        Arc::get_mut(plugin_mut)
            .context("Couldn't get mutable reference to plugin because it has more than one reference")?
            .enable()
            .context("Couldn't enable plugin")?;

        log::info!("Enabled plugin `{}` (UUID: {})", plugin_mut.friendly_name(), uuid);

        self.place_plugin(uuid)
    }

    pub fn disable_plugin(&mut self, uuid: &Uuid) -> Result<()> {
        let plugin = self.plugins.get_mut(&uuid).context("plugin was not found")?;

        if self.listener.as_ptr() == Arc::as_ptr(plugin) {
            self.listener = Weak::new();
        }

        if self.resolver.as_ptr() == Arc::as_ptr(plugin) {
            self.resolver = Weak::new();
        }

        let rc = Arc::get_mut(plugin)
            .context("Couldn't get mutable reference to plugin")?
            .disable();

        log::info!("Disabled plugin `{}` (UUID: {})", plugin.friendly_name(), uuid);

        rc
    }

    fn disable_listener(&mut self) -> Result<()> {
        self.listener = Weak::new();
        for enabled_listener in self.plugins.values_mut()
            .filter(|p| p.enabled() && p.is_listener())
            {
                Arc::get_mut(enabled_listener)
                    .with_context(|| format!("Failed to get mutable reference to currently enabled listener"))?
                    .disable()
                    .context("Failed to disable currently enabled listener")?;
            };

        Ok(())
    }

    fn disable_resolver(&mut self) -> Result<()> {
        self.resolver = Weak::new();
        for enabled_resolver in self.plugins.values_mut()
            .filter(|p| p.enabled() && p.is_resolver())
            {
                Arc::get_mut(enabled_resolver)
                    .with_context(|| format!("Failed to get mutable reference to currently enabled listener"))?
                    .disable()
                    .context("Failed to disable currently enabled listener")?;
            };

        Ok(())
    }

    fn place_plugin(&mut self, uuid: &Uuid) -> Result<()> {
        let plugin = self.plugins.get_mut(&uuid).context("plugin was not found")?;
        if plugin.is_listener() {
            self.listener = Arc::downgrade(plugin);
        }

        if plugin.is_resolver() {
            self.resolver = Arc::downgrade(plugin);
        };

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
            log::error!("No listener is enabled, server will be unable to handle DNS requests");
        };

        if missing_resolver {
            log::error!("No resolver is enabled, server will be unable to handle DNS requests");
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

    pub fn encode(&self, message: Box<ffi::DnsMessage>) -> Result<Vec<u8>, PluginExecutorError> {
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

    pub fn has_listener(&self) -> bool {
        self.listener.strong_count() > 0
    }

    pub fn has_resolver(&self) -> bool {
        self.resolver.strong_count() > 0
    }
}
