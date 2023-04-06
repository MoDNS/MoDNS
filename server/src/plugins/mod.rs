
use std::ffi::c_void;

use modns_sdk::types::ffi;

pub mod manager;
pub mod plugin;
pub mod metadata;
pub mod handler;

#[repr(u8)]
#[derive(Debug, Clone, Copy)]
pub enum ResponseSource {
    Interceptor = 0,
    Resolver,
    Validator
}

type SdkInitFn = extern "Rust" fn(&str, &'static dyn log::Log) -> Result<(), log::SetLoggerError>;

type SetupFn = unsafe extern "C" fn() -> *mut c_void;

type TeardownFn = unsafe extern "C" fn(*mut c_void);

type ListenerDecodeFn = unsafe extern "C" fn(
    ffi::ByteVector,
    *mut ffi::DnsMessage,
    *mut c_void
) -> u8;

type ListenerEncodeFn = unsafe extern "C" fn(
    *const ffi::DnsMessage,
    *mut ffi::ByteVector,
    *mut c_void
) -> u8;

type InterceptorFn = unsafe extern "C" fn(
    *const ffi::DnsMessage,
    *mut ffi::DnsMessage,
    *mut c_void
) -> u8;

type ResolverFn = unsafe extern "C" fn(
    *const ffi::DnsMessage,
    *mut ffi::DnsMessage,
    *mut c_void
) -> u8;

type ValidatorFn = unsafe extern "C" fn(
    *const ffi::DnsMessage,
    *const ffi::DnsMessage,
    *mut ffi::DnsMessage,
    *mut c_void
) -> u8;

type InspectorFn = unsafe extern "C" fn(
    *const ffi::DnsMessage,
    *const ffi::DnsMessage,
    u8,
    *mut c_void
) -> u8;
