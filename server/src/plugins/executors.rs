
use std::{ffi::c_char, collections::BTreeMap, sync::{Arc, Weak}, path::{PathBuf, Path}, error::Error, fmt::Display};

use libloading::{Symbol, Library};
use modns_sdk::ffi;
use uuid::Uuid;

use super::{ResolverFn, ListenerEncodeFn, ListenerDecodeFn, loaders::PluginLoaderError};

#[derive(Debug, PartialEq, Eq)]
pub enum PluginExecutorError {
    ErrorCode(u8),
    DoesNotImplement,
    NoneEnabled,
    InvalidReturnValue(modns_sdk::FfiConversionError),
    ThreadJoinFailed(String)
}

impl Display for PluginExecutorError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PluginExecutorError::ErrorCode(rc) => write!(f, "plugin returned error code {rc}"),
            PluginExecutorError::DoesNotImplement => write!(f, "Module implementation was not found for a plugin"),
            PluginExecutorError::NoneEnabled => write!(f, "No plugins are enabled that implement the reuired module"),
            PluginExecutorError::InvalidReturnValue(v) => write!(f, "Got an error while converting the plugin's output: {v:#?}"),
            PluginExecutorError::ThreadJoinFailed(e) => write!(f, "Failed to join thread: {e}"),
        }
    }
}
impl Error for PluginExecutorError {}

impl From<u8> for PluginExecutorError {
    fn from(value: u8) -> Self {
        Self::ErrorCode(value)
    }
}

impl From<modns_sdk::FfiConversionError> for PluginExecutorError{
    fn from(value: modns_sdk::FfiConversionError) -> Self {
        Self::InvalidReturnValue(value)
    }
}

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin {
    lib: Library,
    home_dir: PathBuf,
    is_listener: bool,
    is_resolver: bool,
    enabled: bool
}

impl DnsPlugin {
    pub(crate) fn new(
        lib: Library,
        is_listener: bool,
        is_resolver: bool,
        home_dir: PathBuf,
        enabled: bool
    ) -> Self {
        Self{
            lib,
            is_listener,
            is_resolver,
            home_dir,
            enabled
        }
    }
    
    pub fn is_listener(&self) -> bool {
        self.is_listener
    }

    pub fn is_resolver(&self) -> bool {
        self.is_resolver
    }

    pub fn decode(&self, buf: &[u8]) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ListenerDecodeFn> = unsafe { self.lib.get(b"impl_decode_req") }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut message = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {f(buf.into(), message.as_mut())};

        if rc == 0 {
            Ok(message)
        } else {
            Err(rc.into())
        }
    }

    pub fn encode(&self, message: Box<ffi::DnsMessage>) -> Result<Vec<c_char>, PluginExecutorError> {

        let f: Symbol<ListenerEncodeFn> = unsafe { self.lib.get(b"impl_encode_resp") }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut buf = Vec::new().into();

        let rc = unsafe {
            f(message.as_ref(), &mut buf)
        };

        if rc != 0 {
            Err(PluginExecutorError::ErrorCode(rc))
        } else {
            Ok(buf.try_into()?)
        }

    }

    pub fn resolve(&self, req: Box<ffi::DnsMessage>) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ResolverFn> = unsafe { self.lib.get(b"impl_resolve_req") }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {
            f(req.as_ref(), resp.as_mut())
        };

        if rc == 0 {
            Ok(resp)
        } else {
            Err(rc.into())
        }

    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    pub fn home_dir(&self) -> &Path {
        &self.home_dir
    }
}

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