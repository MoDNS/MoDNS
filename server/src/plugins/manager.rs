
use std::ffi::c_void;
use std::path::{PathBuf, Path};
use std::sync::{Arc, Weak};
use std::collections::BTreeMap;

use anyhow::{Context, Result, bail};
use modns_sdk::types::ffi;
use uuid::Uuid;


use crate::ServerConfig;

use super::ResponseSource;
use super::response::ApiResponse;

use super::plugin::{DnsPlugin, PluginExecutorError};

pub struct PluginManager {
    plugins: BTreeMap<uuid::Uuid, Arc<DnsPlugin>>,
    listener: Weak<DnsPlugin>,
    interceptors: Vec<Weak<DnsPlugin>>,
    resolver: Weak<DnsPlugin>,
    validators: Vec<Weak<DnsPlugin>>,
    inspectors: Vec<Weak<DnsPlugin>>,
    config: ServerConfig,
}

impl PluginManager {
    pub fn new(config: ServerConfig) -> Self {
        Self {
            plugins: BTreeMap::new(),
            listener: Weak::new(),
            interceptors: Vec::new(),
            resolver: Weak::new(),
            validators: Vec::new(),
            inspectors: Vec::new(),
            config
        }
    }

    pub fn load<P: AsRef<Path>>(&mut self, dir_path: P, enable: bool) -> Result<Uuid> {
        let id = Uuid::new_v4();

        let dir = PathBuf::from(dir_path.as_ref()).canonicalize().context("Couldn't canonicalize plugin path")?;

        let plugin = Arc::new(DnsPlugin::load(&dir, self.config())?);

        let name = plugin.friendly_name().to_owned();

        log::info!("Loaded plugin `{name}` from directory {}", dir.display());

        log::trace!("Metadata for `{name}`:\n{:#?}", plugin.metadata());


        self.plugins.insert(id, plugin);

        if enable {
            if let Err(e) = self.enable_plugin(&id) {
                log::warn!("Failed to initialize plugin `{name}` on load: {e}");
            };
        }

        Ok(id)
    }

    pub fn search(&mut self, search_path: &[PathBuf]) -> Result<()>{
        for parent in search_path {
            let parent = match parent.canonicalize() {
                Ok(path) => path,
                Err(e) => {
                    log::warn!("Failed to search {} for plugins: {e}", parent.display());
                    log::debug!("Full Error: {e:#?}");
                    continue;
                },
            };

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

                        let so_path = subdir.join(super::PLUGIN_FILE_NAME);

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

        let plugin = self.plugins().get(uuid)
            .with_context(|| ApiResponse::new(404, format!("Failed to get plugin with uuid {uuid}")))?;

        if plugin.enabled() {
            bail!(ApiResponse::new(200, "Plugin already enabled".to_string()))
        }

        if plugin.is_listener() && self.has_listener() {
            self.disable_listener()?;
        }

        let plugin = self.plugins().get(uuid).context("Plugin went missing during execution")?;

        if plugin.is_resolver() && self.has_resolver() {
            self.disable_resolver()?;
        }

        let plugin_mut = self.plugins.get_mut(uuid).context("Plugin went missing during execution")?;

        Arc::get_mut(plugin_mut)
            .context("Couldn't get mutable reference to plugin because it has more than one reference")?
            .enable()
            .context("Couldn't enable plugin")?;

        log::info!("Enabled plugin `{}` (UUID: {})", plugin_mut.friendly_name(), uuid);

        self.place_plugin(uuid)
    }

    pub fn disable_plugin(&mut self, uuid: &Uuid) -> Result<()> {
        let plugin = self.plugins.get_mut(&uuid)
            .with_context(|| ApiResponse::new(404, format!("Failed to get plugin with uuid {uuid}")))?;

        if self.listener.as_ptr() == Arc::as_ptr(plugin) {
            self.listener = Weak::new();
        }

        if self.resolver.as_ptr() == Arc::as_ptr(plugin) {
            self.resolver = Weak::new();
        }

        if plugin.is_interceptor() {
            self.interceptors.retain(|r| r.as_ptr() != Arc::as_ptr(plugin))
        };

        if plugin.is_validator() {
            self.validators.retain(|r| r.as_ptr() != Arc::as_ptr(plugin))
        };

        if plugin.is_inspector() {
            self.inspectors.retain(|r| r.as_ptr() != Arc::as_ptr(plugin))
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

        let plugin = self.plugins.get(&uuid).context("plugin was not found")?;

        if plugin.is_listener() {
            self.listener = Arc::downgrade(plugin);
        }

        if plugin.is_resolver() {
            self.resolver = Arc::downgrade(plugin);
        };

        if plugin.is_interceptor() {
            self.interceptors.push(Arc::downgrade(plugin))
        }

        if plugin.is_validator() {
            self.validators.push(Arc::downgrade(plugin))
        }

        if plugin.is_inspector() {
            self.inspectors.push(Arc::downgrade(plugin))
        }

        log::trace!("Plugin Manager initialized with: {:#?}", self.list_metadata());

        Ok(())
    }

    /// Validate the [PluginManager] by checking that it has the
    /// minimum number of enabled plugins to resolve DNS requests
    /// (i.e. at least a Listener & Resolver)
    /// 
    pub fn is_valid_state(&self, return_err: bool) -> Result<()> {
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

    pub fn poll_listeners(&self) -> Result<Option<(ffi::DnsMessage, Arc<DnsPlugin>, *mut c_void)>, PluginExecutorError> {

        let Some(listener) = self.listener.upgrade() else {
            return Ok(None)
        };

        let mut msg = ffi::DnsMessage::default();

        if let Some(request_ptr) = listener.poll(&mut msg)? {
            log::trace!("Got request from listener");
            return Ok(Some((msg, Arc::clone(&listener), request_ptr)));
        };

        Ok(None)

    }

    pub fn poll_interceptors(&self, req: &Box<ffi::DnsMessage>) -> Result<Option<Box<ffi::DnsMessage>>, PluginExecutorError> {
        
        for plugin_weakref in &self.interceptors {

            let Some(plugin) = plugin_weakref.upgrade() else {
                log::error!("An interceptor plugin went missing unexpectedly");
                continue;
            };

            match plugin.check_intercept(req) {

                Ok(Some(resp)) => return Ok(Some(resp)),

                Ok(None) => continue,

                Err(e) => {
                    log::error!("Attempt to poll interceptor plugin `{}` encountered an unrecoverable error: {e}", plugin.friendly_name());
                    log::debug!("Full error: {e:#?}");
                    continue;
                },
            }
        }

        Ok(None)
    }

    pub fn resolve(&self, request: &Box<ffi::DnsMessage>) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {
        self.resolver.upgrade()
            .ok_or(PluginExecutorError::NoneEnabled)?
            .resolve(request)
    }

    pub fn poll_validators(&self, req: &Box<ffi::DnsMessage>, resp: &Box<ffi::DnsMessage>) -> Result<Option<Box<ffi::DnsMessage>>, PluginExecutorError> {

        for plugin_weakref in &self.validators {

            let Some(plugin) = plugin_weakref.upgrade() else {
                log::error!("An interceptor plugin went missing unexpectedly");
                continue;
            };

            match plugin.validate(req, resp) {

                Ok(Some(resp)) => return Ok(Some(resp)),

                Ok(None) => continue,

                Err(e) => {
                    log::error!("Attempt to poll validator plugin `{}` encountered an unrecoverable error: {e}", plugin.friendly_name());
                    log::debug!("Full error: {e:#?}");
                    continue;
                },
            }
        }

        Ok(None)
    }

    pub fn notify_inspectors(&self, req: &Box<ffi::DnsMessage>, resp: &Box<ffi::DnsMessage>, source: ResponseSource) {

        for plugin_weakref in &self.inspectors {

            let Some(plugin) = plugin_weakref.upgrade() else {
                log::error!("An inspector plugin went missing unexpectedly");
                continue;
            };

            if let Err(e) = plugin.inspect(req, resp, source) {
                log::error!("Attempt to notify inspector plugin `{}` encountered an unrecoverable error: {e}", plugin.friendly_name());
                log::debug!("Full error: {e:#?}");
                continue;
            }
        }
    }

    pub fn plugins(&self) -> &BTreeMap<uuid::Uuid, Arc<DnsPlugin>> {
        &self.plugins
    }

    pub fn has_listener(&self) -> bool {
        self.listener.strong_count() > 0
    }

    pub fn num_interceptors(&self) -> usize {
        self.interceptors.len()
    }

    pub fn has_resolver(&self) -> bool {
        self.resolver.strong_count() > 0
    }

    pub fn num_inspectors(&self) -> usize {
        self.inspectors.len()
    }

    pub fn num_validators(&self) -> usize {
        self.validators.len()
    }

    pub fn config(&self) -> &ServerConfig {
        &self.config
    }

    pub fn config_mut(&mut self) -> &mut ServerConfig {
        &mut self.config
    }
}
