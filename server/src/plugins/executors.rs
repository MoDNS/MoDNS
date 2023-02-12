
use libloading::Symbol;
use modns_sdk::ffi;

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin<'lib> {
    pub(crate) deserializer: Symbol<'lib, super::ListenerDeserializeFn>
}

impl DnsPlugin<'_> {
    pub fn deserialize(&self, buf: &'_ mut [u8]) -> Box<ffi::DnsMessage> {

        let f = &self.deserializer;

        let mut message = Box::new(ffi::DnsMessage::default());

        unsafe {f(buf.as_mut_ptr(), buf.len(), message.as_mut())};

        message
    }
}
