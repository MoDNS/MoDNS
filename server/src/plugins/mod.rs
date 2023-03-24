use std::ffi::c_void;

pub mod manager;
pub mod plugin;
pub mod metadata;

type SetupFn = unsafe extern "C" fn() -> *mut c_void;

type TeardownFn = unsafe extern "C" fn(*mut c_void);

type ListenerDecodeFn = unsafe extern "C" fn(
    modns_sdk::ffi::ByteVector,
    *mut modns_sdk::ffi::DnsMessage,
    *mut c_void
) -> u8;

type ListenerEncodeFn = unsafe extern "C" fn(
    *const modns_sdk::ffi::DnsMessage,
    *mut modns_sdk::ffi::ByteVector,
    *mut c_void
) -> u8;

type ResolverFn = unsafe extern "C" fn(
    *const modns_sdk::ffi::DnsMessage,
    *mut modns_sdk::ffi::DnsMessage,
    *mut c_void
) -> u8;
