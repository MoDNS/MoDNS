
use libloading::Symbol;
use modns_sdk::ffi;

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin<'lib> {
    pub(crate) deserializer: Symbol<'lib, super::ListenerDeserializeFn>
}

impl DnsPlugin<'_> {
    pub fn deserialize(&self, buf: &'_ [u8]) -> Result<Box<ffi::DnsMessage>, u8> {

        let f = &self.deserializer;

        let mut message = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {f(buf.as_ptr(), buf.len(), message.as_mut())};

        if rc == 0 {
            Ok(message)
        } else {
            Err(rc)
        }
    }
}
