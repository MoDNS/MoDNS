
use super::{executors::DnsPlugin, ListenerDecodeFn, ListenerEncodeFn, ResolverFn};
use libloading::{Symbol, Library};
use std::ffi::OsStr;

#[derive(Debug)]
pub enum PluginLoaderError {
    LibraryLoadError(libloading::Error),
    NoListeners,
    NoResolvers,
}

impl From<libloading::Error> for PluginLoaderError {
    fn from(value: libloading::Error) -> Self {
        Self::LibraryLoadError(value)
    }
}

impl DnsPlugin {
    pub(crate) fn load<P: AsRef<OsStr>>(path: P) -> Result<Self, libloading::Error> {

        let lib = unsafe { Library::new(path) }?;

        let is_listener =
        get_sym::<ListenerDecodeFn>(&lib, b"impl_decode_req")?.is_some() &&
        get_sym::<ListenerEncodeFn>(&lib, b"impl_encode_resp")?.is_some();

        let is_resolver =
        get_sym::<ResolverFn>(&lib, b"impl_resolve_req")?.is_some();

        Ok(Self::new(lib, is_listener, is_resolver))
    }

}

fn get_sym<'lib, T> (lib: &'lib Library, name: &[u8]) -> Result<Option<Symbol<'lib, T>>, libloading::Error> {
    let sym = unsafe {
        lib.get(name)
    };

    match sym {
        Ok(s) => Ok(Some(s)),
        Err(libloading::Error::DlSym{ desc: _ }) => Ok(None),
        Err(e) => Err(e),
    }
}
