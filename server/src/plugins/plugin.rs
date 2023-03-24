
use super::{ListenerDecodeFn, ListenerEncodeFn, ResolverFn, SetupFn, TeardownFn};
use modns_sdk::{ffi, PluginState};

use libloading::{Symbol, Library};
use serde::Deserialize;
use anyhow::Result;
use thiserror::Error;

use std::{fs, io};
use std::path::{PathBuf, Path};
use std::ffi::{OsStr, c_char, c_void};

const SETUP_FN_NAME:    &[u8] = b"impl_plugin_setup";
const TEARDOWN_FN_NAME: &[u8] = b"impl_plugin_teardown";
const DECODER_FN_NAME:  &[u8] = b"impl_listener_sync_decode_req";
const ENCODER_FN_NAME:  &[u8] = b"impl_listener_sync_encode_resp";
const RESOLVER_FN_NAME: &[u8] = b"impl_resolver_sync_resolve_req";

#[derive(Debug, Error)]
pub enum PluginLoaderError {
    #[error("Unable to load library")]
    LibraryLoadError(#[from] libloading::Error),
    #[error("Unable to open manifest.yaml")]
    ManifestOpenError(#[from] io::Error),
    #[error("Unable to read manifest.yaml")]
    ManifestReadError(#[from] serde_yaml::Error),
}

#[derive(Error, Debug, PartialEq, Eq)]
pub enum PluginExecutorError {
    #[error("Plugin returned error code {0}")]
    ErrorCode(u8),
    #[error("Required module implementation was not found for a plugin")]
    DoesNotImplement,
    #[error("No plugins are enabled that implement the required module")]
    NoneEnabled,
    #[error("Got an error while converting the plugin's output: {0:?}")]
    InvalidReturnValue(modns_sdk::FfiConversionError),
    #[error("Failed to join handler thread: {0}")]
    ThreadJoinFailed(String)
}

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

#[derive(Deserialize)]
struct PluginManifest {
    friendly_name: String,
    description: String
}

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin {

    /// Object containing the actual plugin binary in memory
    lib: Library,

    /// Location of the plugin's home directory
    home_dir: PathBuf,

    /// Whether the function is a listener, i.e. if callers should expect
    /// that encode() and decode() can be called on this plugin
    is_listener: bool,

    /// Whether this plugin is a resolver, i.e. if callers should expect
    /// that resolve() can be called on this plugin
    is_resolver: bool,

    /// Whether this plugin should be treated as being enabled
    enabled: bool,

    /// Human-readable name for this plugin provided by the author in the
    /// plugin's `manifest.yaml` file
    friendly_name: String,

    /// Human-readable description for this plugin provided by the author
    /// in the plugin's `manifest.yaml` file
    description: String,

    state_ptr: PluginState
}

impl DnsPlugin {
    pub(crate) fn new(
        lib: Library,
        is_listener: bool,
        is_resolver: bool,
        home_dir: PathBuf,
        enabled: bool,
        friendly_name: String,
        description: String,
        state_ptr: PluginState,
    ) -> Self {
        Self{
            lib,
            is_listener,
            is_resolver,
            home_dir,
            enabled,
            friendly_name,
            description,
            state_ptr,
        }
    }
    
    pub fn decode(&self, buf: &[u8]) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ListenerDecodeFn> = unsafe { self.lib.get(DECODER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut message = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {f(buf.into(), message.as_mut(), self.state_ptr.into())};

        if rc == 0 {
            Ok(message)
        } else {
            Err(rc.into())
        }
    }

    pub fn encode(&self, message: Box<ffi::DnsMessage>) -> Result<Vec<c_char>, PluginExecutorError> {

        let f: Symbol<ListenerEncodeFn> = unsafe { self.lib.get(ENCODER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut buf = Vec::new().into();

        let rc = unsafe {
            f(message.as_ref(), &mut buf, self.state_ptr.into())
        };

        if rc != 0 {
            Err(PluginExecutorError::ErrorCode(rc))
        } else {
            Ok(buf.try_into()?)
        }

    }

    pub fn resolve(&self, req: Box<ffi::DnsMessage>) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ResolverFn> = unsafe { self.lib.get(RESOLVER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {
            f(req.as_ref(), resp.as_mut(), self.state_ptr.into())
        };

        if rc == 0 {
            Ok(resp)
        } else {
            Err(rc.into())
        }

    }

    pub fn load<P: AsRef<OsStr>>(home_dir: P, enable: bool) -> Result<Self, PluginLoaderError> {

        let home_dir = PathBuf::from(home_dir.as_ref());

        let lib = unsafe { Library::new(home_dir.join("plugin.so")) }?;

        let manifest_file = fs::read_to_string(home_dir.join("manifest.yaml"))?;

        let manifest: PluginManifest = serde_yaml::from_str(&manifest_file)?;

        let is_listener =
        check_sym::<ListenerDecodeFn>(&lib, DECODER_FN_NAME)?.is_some() &&
            check_sym::<ListenerEncodeFn>(&lib, ENCODER_FN_NAME)?.is_some();

        let is_resolver =
        check_sym::<ResolverFn>(&lib, RESOLVER_FN_NAME)?.is_some();

        let state_ptr = match (enable, check_sym::<SetupFn>(&lib, SETUP_FN_NAME)?) {
            (true, Some(f)) => unsafe { f() },
            _ => std::ptr::null_mut(),
        };

        Ok(Self::new(
            lib, 
            is_listener,
            is_resolver,
            home_dir,
            enable,
            manifest.friendly_name,
            manifest.description,
            state_ptr.into()
        ))
    }

    pub fn enable(&mut self) -> Result<()> {
        self.state_ptr = if let Some(f) = check_sym::<SetupFn>(&self.lib, SETUP_FN_NAME)? {
            unsafe { f() }.into()
        } else { std::ptr::null_mut::<c_void>().into() };

        self.enabled = true;

        Ok(())
    }

    pub fn disable(&mut self) -> Result<()> {
        
        if let Some(f) = check_sym::<TeardownFn>(&self.lib, TEARDOWN_FN_NAME)? {
            unsafe { f(self.state_ptr.into()) }
        };

        self.state_ptr = std::ptr::null_mut::<c_void>().into();

        self.enabled = false;

        Ok(())
    }

    pub fn is_listener(&self) -> bool {
        self.is_listener
    }

    pub fn is_resolver(&self) -> bool {
        self.is_resolver
    }


    pub fn enabled(&self) -> bool {
        self.enabled
    }

    pub fn home_dir(&self) -> &Path {
        &self.home_dir
    }

    pub fn friendly_name(&self) -> &str {
        self.friendly_name.as_ref()
    }

    pub fn description(&self) -> &str {
        self.description.as_ref()
    }
}

fn check_sym<'lib, T> (lib: &'lib Library, name: &[u8]) -> Result<Option<Symbol<'lib, T>>, libloading::Error> {
    let sym = unsafe {
        lib.get(name)
    };

    match sym {
        Ok(s) => Ok(Some(s)),
        Err(libloading::Error::DlSym{ desc: _ }) => Ok(None),
        Err(e) => Err(e),
    }
}
