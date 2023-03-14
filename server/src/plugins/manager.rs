
use std::path::{PathBuf, Path};
use std::sync::{Arc, Weak};
use std::collections::BTreeMap;

use modns_sdk::ffi;
use uuid::Uuid;

use super::plugin::{DnsPlugin, PluginLoaderError, PluginExecutorError};

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

    pub fn load<P: AsRef<Path>>(&mut self, dir_path: P, enable: bool) -> Result<(), PluginLoaderError>{
        let id = Uuid::new_v4();

        let dir = PathBuf::from(dir_path.as_ref());

        self.plugins.insert(
            id,
            Arc::new(
                DnsPlugin::load(dir.clone(), enable)?
            )
        );

        log::info!("Loaded plugin {id} from directory {}", dir.display());

        Ok(())
    }

    pub fn search(&mut self, search_path: &[PathBuf]) {
        for parent in search_path {

            match parent.read_dir() {
                Ok(dir_info) => {
                    let dirs = dir_info.filter_map(|d| {
                        match d {
                            Ok(f) if f.file_type().ok()?.is_dir()=> Some(f.path()),
                            Ok(_) => None,
                            Err(_) => None,
                        }
                    });

                    for subdir in dirs {
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

    pub fn init(&mut self) {
        self.listener = match self.plugins.values().find(|p| p.is_listener()) {
            Some(p) => Arc::downgrade(p),
            None => Weak::new(),
        };

        self.resolver = match self.plugins.values().find(|p| p.is_resolver()) {
            Some(p) => Arc::downgrade(p),
            None => Weak::new(),
        };
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