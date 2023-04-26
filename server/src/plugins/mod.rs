
use std::{ffi::c_void};

use modns_sdk::types::{ffi};

pub mod manager;
pub mod plugin;
pub mod metadata;
pub mod handler;
pub mod response;

#[repr(u8)]
#[derive(Debug, Clone, Copy)]
pub enum ResponseSource {
    Interceptor = 0,
    Resolver,
    Validator
}

const PLUGIN_FILE_NAME: &str = const_format::formatcp!("plugin_{}.so", std::env::consts::ARCH);

type SdkInitFn = extern "Rust" fn(&str, &'static dyn log::Log, safe::DatabaseInfo, PathBuf) -> Result<(), log::SetLoggerError>;

type SetupFn = unsafe extern "C" fn() -> *mut c_void;

type TeardownFn = unsafe extern "C" fn(*mut c_void);

type ListenerDecodeFn = unsafe extern "C" fn(
    &ffi::ByteVector,
    &mut ffi::DnsMessage,
    *const c_void
) -> u8;

type ListenerEncodeFn = unsafe extern "C" fn(
    &ffi::DnsMessage,
    &mut ffi::ByteVector,
    *const c_void
) -> u8;

type InterceptorFn = unsafe extern "C" fn(
    &ffi::DnsMessage,
    &mut ffi::DnsMessage,
    *const c_void
) -> u8;

type ResolverFn = unsafe extern "C" fn(
    &ffi::DnsMessage,
    &mut ffi::DnsMessage,
    *const c_void
) -> u8;

type ValidatorFn = unsafe extern "C" fn(
    &ffi::DnsMessage,
    &ffi::DnsMessage,
    &mut ffi::DnsMessage,
    *const c_void
) -> u8;

type InspectorFn = unsafe extern "C" fn(
    &ffi::DnsMessage,
    &ffi::DnsMessage,
    u8,
    *const c_void
) -> u8;
