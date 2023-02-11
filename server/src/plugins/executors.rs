
use libloading::Symbol;

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin<'lib> {
    pub(crate) deserializer: Symbol<'lib, super::DnsDeserializeFn>
}

impl DnsPlugin<'_> {
    pub fn deserialize(&self, buf: &'_ mut [u8]) -> modns_sdk::DnsHeader {

        let f = &self.deserializer;

        unsafe {f(buf.as_mut_ptr(), buf.len())}
    }
}
