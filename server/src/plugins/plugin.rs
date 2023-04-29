
use crate::ServerConfig;

use super::{ListenerDecodeFn, ListenerEncodeFn, ResolverFn, SetupFn, TeardownFn, SdkInitFn, InterceptorFn, ValidatorFn, InspectorFn, ResponseSource, PLUGIN_FILE_NAME, ListenerPollFn, ListenerRespondFn};
use modns_sdk::types::conversion::FfiVector;
use modns_sdk::{types::ffi, PluginState};

use libloading::{Symbol, Library};
use serde::Deserialize;
use anyhow::Result;
use thiserror::Error;

use std::{fs, io};
use std::path::{PathBuf, Path};
use std::ffi::{OsStr, c_void, OsString};

const SDK_INIT_FN_NAME:     &[u8] = b"_init_modns_sdk";
const SETUP_FN_NAME:        &[u8] = b"impl_plugin_setup";
const TEARDOWN_FN_NAME:     &[u8] = b"impl_plugin_teardown";
const LISTENER_POLL_FN_NAME:&[u8] = b"impl_listener_async_poll";
const LISTENER_RESP_FN_NAME:&[u8] = b"impl_listener_async_respond";
const DECODER_FN_NAME:      &[u8] = b"impl_listener_sync_decode_req";
const ENCODER_FN_NAME:      &[u8] = b"impl_listener_sync_encode_resp";
const INTERCEPTOR_FN_NAME:  &[u8] = b"impl_intercept_req";
const RESOLVER_FN_NAME:     &[u8] = b"impl_resolver_sync_resolve_req";
const VALIDATOR_FN_NAME:    &[u8] = b"impl_validate_resp";
const INSPECTOR_FN_NAME:    &[u8] = b"impl_inspect_resp";

#[derive(Debug, Error)]
pub enum PluginLoaderError {
    #[error("Unable to load library")]
    LibraryLoadError(#[from] libloading::Error),
    #[error("Unable to open manifest.yaml")]
    ManifestOpenError(#[from] io::Error),
    #[error("Unable to read manifest.yaml")]
    ManifestReadError(#[from] serde_yaml::Error),
    #[error("SDK initialization failed")]
    SDKInitError,
    #[error("Couldn't get name from directory")]
    InvalidName,
}

#[derive(Error, Debug)]
pub enum PluginExecutorError {
    #[error("Plugin returned error code {0}")]
    ErrorCode(u8),
    #[error("Required module implementation was not found for a plugin")]
    DoesNotImplement,
    #[error("Plugin library returned an error")]
    LibraryError(#[from] libloading::Error),
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

impl PluginExecutorError {
    pub fn error_code(&self) -> Option<u8> {
        if let Self::ErrorCode(e) = self {
            Some(*e)
        } else {
            None
        }
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

    /// Whether the function is an interceptor, i.e. if callers should
    /// expect that check_intercept() can be called on this plugin
    is_interceptor: bool,

    /// Whether this plugin is a resolver, i.e. if callers should expect
    /// that resolve() can be called on this plugin
    is_resolver: bool,

    /// Whether this plugin is a validator, i.e., if callers should expect
    /// that validate() can be called on this plugin
    is_validator: bool,

    /// Whether this plugin is an inspector, i.e., if callers should expect
    /// that notify_inspector() can be called on this plugin
    is_inspector: bool,

    /// Whether this plugin should be treated as being enabled
    enabled: bool,

    /// Short, CLI-friendly name for the plugin. Used to uniquely identify
    /// plugin. Derived from plugin home directory
    short_name: String,

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
        home_dir: PathBuf,
        short_name: String,
        friendly_name: String,
        description: String,
    ) -> Result<Self, PluginLoaderError> {

        let is_listener =
        check_sym::<ListenerPollFn>(&lib, LISTENER_POLL_FN_NAME)?.is_some() &&
            check_sym::<ListenerRespondFn>(&lib, LISTENER_RESP_FN_NAME)?.is_some();

        let is_interceptor = 
        check_sym::<InterceptorFn>(&lib, INTERCEPTOR_FN_NAME)?.is_some();

        let is_resolver =
        check_sym::<ResolverFn>(&lib, RESOLVER_FN_NAME)?.is_some();

        let is_validator = 
        check_sym::<ValidatorFn>(&lib, VALIDATOR_FN_NAME)?.is_some();

        let is_inspector =
        check_sym::<InspectorFn>(&lib, INSPECTOR_FN_NAME)?.is_some();

        Ok(Self{
            lib,
            is_listener,
            is_interceptor,
            is_resolver,
            is_validator,
            is_inspector,
            home_dir,
            enabled: false,
            short_name,
            friendly_name,
            description,
            state_ptr: PluginState::new(),
        })

    }

    pub fn poll(&self, buf: &mut ffi::DnsMessage) -> Result<Option<*mut c_void>, PluginExecutorError> {

        let f = check_sym::<ListenerPollFn>(&self.lib, LISTENER_POLL_FN_NAME)?
            .ok_or(PluginExecutorError::DoesNotImplement)?;

        let mut req_state = std::ptr::null_mut();

        let rc = unsafe {
            f(buf, &mut req_state, self.state_ptr.ptr())
        };

        match rc {
            0 => Ok(Some(req_state)),
            1 => Ok(None),
            e => Err(PluginExecutorError::ErrorCode(e))
        }
    }

    pub fn respond(&self, resp: &ffi::DnsMessage, req_state: *mut c_void) -> Result<(), PluginExecutorError> {

        let f = check_sym::<ListenerRespondFn>(&self.lib, LISTENER_RESP_FN_NAME)?
            .ok_or(PluginExecutorError::DoesNotImplement)?;

        let rc = unsafe {
            f(resp, req_state, self.state_ptr.ptr())
        };

        match rc {
            0 => Ok(()),
            e => Err(PluginExecutorError::ErrorCode(e))
        }

    }
    
    pub fn decode(&self, buf: &[u8]) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ListenerDecodeFn> = unsafe { self.lib.get(DECODER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut message = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {f(&buf.into(), message.as_mut(), self.state_ptr.ptr())};

        if rc == 0 {
            Ok(message)
        } else {
            Err(rc.into())
        }
    }

    pub fn encode(&self, message: Box<ffi::DnsMessage>) -> Result<Vec<u8>, PluginExecutorError> {

        let f: Symbol<ListenerEncodeFn> = unsafe { self.lib.get(ENCODER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut buf = ffi::ByteVector::from_safe_vec(Vec::new());

        let rc = unsafe {
            f(message.as_ref(), &mut buf, self.state_ptr.ptr())
        };

        if rc != 0 {
            Err(PluginExecutorError::ErrorCode(rc))
        } else {
            Ok(unsafe { buf.try_safe_vec() }?)
        }

    }

    pub fn check_intercept(&self, req: &Box<ffi::DnsMessage>) -> Result<Option<Box<ffi::DnsMessage>>, PluginExecutorError> {

        let f = check_sym::<InterceptorFn>(&self.lib, INTERCEPTOR_FN_NAME)?
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let mut resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe{
            f(req.as_ref(), resp.as_mut(), self.state_ptr.ptr())
        };

        match rc {
            0 => Ok(None),
            1 => Ok(Some(resp)),
            e => Err(PluginExecutorError::ErrorCode(e))
        }

    }

    pub fn resolve(&self, req: &Box<ffi::DnsMessage>) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f: Symbol<ResolverFn> = unsafe { self.lib.get(RESOLVER_FN_NAME) }
        .or(Err(PluginExecutorError::DoesNotImplement))?;

        let mut resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {
            f(req.as_ref(), resp.as_mut(), self.state_ptr.ptr())
        };

        if rc == 0 {
            Ok(resp)
        } else {
            Err(rc.into())
        }

    }

    pub fn validate(&self, req: &Box<ffi::DnsMessage>, resp: &Box<ffi::DnsMessage>) -> Result<Option<Box<ffi::DnsMessage>>, PluginExecutorError> {

        let f = check_sym::<ValidatorFn>(&self.lib, VALIDATOR_FN_NAME)?
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let mut err_resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe{
            f(req.as_ref(), resp.as_ref(), err_resp.as_mut(), self.state_ptr.ptr())
        };

        match rc {
            0 => Ok(None),
            1 => Ok(Some(err_resp)),
            e => Err(PluginExecutorError::ErrorCode(e))
        }

    }

    pub fn inspect(&self, req: &Box<ffi::DnsMessage>, resp: &Box<ffi::DnsMessage>, source: ResponseSource) -> Result<(), PluginExecutorError> {

        let f = check_sym::<InspectorFn>(&self.lib, INSPECTOR_FN_NAME)?
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let rc = unsafe{
            f(req.as_ref(), resp.as_ref(), source as u8, self.state_ptr.ptr())
        };

        if rc != 0 {
            Err(PluginExecutorError::ErrorCode(rc))
        } else {
            Ok(())
        }

    }

    pub fn load<P: AsRef<OsStr>>(home_dir: P, config: &ServerConfig) -> Result<Self, PluginLoaderError> {

        let home_dir = PathBuf::from(home_dir.as_ref());

        let short_name = match home_dir.file_name() {
            Some(name) => name.to_string_lossy().into_owned(),
            None => return Err(PluginLoaderError::InvalidName),
        };

        let lib = unsafe { Library::new(home_dir.join(PLUGIN_FILE_NAME)) }?;

        let log_name = home_dir.file_name()
            .unwrap_or(&OsString::from("unknown"))
            .to_string_lossy()
            .to_string();

        match check_sym::<SdkInitFn>(&lib, SDK_INIT_FN_NAME)? {
            Some(sdk_init) => {

                log::trace!("Initializing SDK logger for {log_name}");

                if let Err(e) = sdk_init(
                    &log_name,
                    log::logger(),
                    config.db_info(),
                    config.data_dir().join("plugin_data").join(&log_name)
                ) {

                    log::error!("Failed to initialize SDK for {log_name}");
                    log::debug!("Got error while initializing SDK: {e:?}");
                };

            }
            None => {
                log::error!("Couldn't find SDK init function for {log_name}");
                return Err(PluginLoaderError::SDKInitError)
            }
        }

        let manifest_file = fs::read_to_string(home_dir.join("manifest.yaml"))?;

        let manifest: PluginManifest = serde_yaml::from_str(&manifest_file)?;

        let plugin = Self::new(
            lib, 
            home_dir,
            short_name,
            manifest.friendly_name,
            manifest.description,
            
        )?;

        Ok(plugin)
    }

    pub fn enable(&mut self) -> Result<()> {

        if self.enabled() {
            log::debug!("Already enabled");
            return Ok(())
        }
        self.state_ptr = if let Some(f) = check_sym::<SetupFn>(&self.lib, SETUP_FN_NAME)? {
            unsafe { f() }.into()
        } else { std::ptr::null_mut::<c_void>().into() };

        self.enabled = true;

        Ok(())
    }

    pub fn disable(&mut self) -> Result<()> {

        if !self.enabled() {
            log::debug!("Already disabled");
            return Ok(())
        }
        
        if let Some(f) = check_sym::<TeardownFn>(&self.lib, TEARDOWN_FN_NAME)? {
            unsafe { f(self.state_ptr.mut_ptr()) }
        };

        self.state_ptr = PluginState::new();

        self.enabled = false;

        Ok(())
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

    pub fn short_name(&self) -> &str {
        self.short_name.as_ref()
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
