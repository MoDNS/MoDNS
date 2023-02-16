
pub mod executors;
pub mod loaders;

type ListenerDecodeFn = unsafe extern "C" fn(
    *const u8,
    usize,
    *mut modns_sdk::ffi::DnsMessage
) -> u8;

type ListenerEncodeFn = unsafe extern "C" fn(
    modns_sdk::ffi::DnsMessage,
    *mut modns_sdk::ffi::ByteVector
) -> u8;

type ResolverFn = unsafe extern "C" fn(
    modns_sdk::ffi::DnsMessage,
    *mut modns_sdk::ffi::DnsMessage
) -> u8;
