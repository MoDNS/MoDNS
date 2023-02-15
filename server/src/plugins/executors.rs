
use std::ffi::c_char;

use libloading::Symbol;
use modns_sdk::ffi;

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin<'lib> {
    decoder: Option<Symbol<'lib, super::ListenerDecodeFn>>,
    encoder: Option<Symbol<'lib, super::ListenerEncodeFn>>,
    resolver: Option<Symbol<'lib, super::ResolverFn>>
}

impl<'lib> DnsPlugin<'lib> {
    pub fn new(
        decoder: Option<Symbol<'lib, super::ListenerDecodeFn>>,
        encoder: Option<Symbol<'lib, super::ListenerEncodeFn>>,
        resolver: Option<Symbol<'lib, super::ResolverFn>>
    ) -> Self {
        Self{ decoder, encoder, resolver }
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum PluginExecutorError {
    ErrorCode(u8),
    DoesNotImplement,
    InvalidReturnValue(modns_sdk::FfiConversionError)
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

impl DnsPlugin<'_> {
    pub fn decode(&self, buf: &'_ [u8]) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f = self.decoder.as_ref()
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let mut message = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {f(buf.as_ptr(), buf.len(), message.as_mut())};

        if rc == 0 {
            Ok(message)
        } else {
            Err(rc.into())
        }
    }

    pub fn encode(&self, message: ffi::DnsMessage) -> Result<Vec<c_char>, PluginExecutorError> {

        let f = self.encoder.as_ref()
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let buf = Vec::new();

        let buf = unsafe {
            f(message, buf.into())
        };

        if buf.ptr.is_null() {
            Err(PluginExecutorError::ErrorCode(2))
        } else {
            Ok(buf.try_into()?)
        }

    }

    pub fn resolve(&self, req: ffi::DnsMessage) -> Result<Box<ffi::DnsMessage>, PluginExecutorError> {

        let f = self.resolver.as_ref()
        .ok_or(PluginExecutorError::DoesNotImplement)?;

        let mut resp = Box::new(ffi::DnsMessage::default());

        let rc = unsafe {
            f(req, resp.as_mut())
        };

        if rc == 0 {
            Ok(resp)
        } else {
            Err(rc.into())
        }

    }
}
