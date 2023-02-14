
use super::executors::DnsPlugin;
use libloading::{Symbol, Library};
use std::path::PathBuf;

/// Stores the dynamic library code that a plugin gets its symbols from
/// 
/// Must outlive the plugin, since the library's lifetime is
/// what actually controls the lifetime of the code referenced by plugins
pub(crate) struct PluginLibrary {
    _path: PathBuf,
    lib: Library
}

impl<'l> DnsPlugin<'l> {
    pub(crate) fn load(lib: &'l PluginLibrary) -> Result<Self, libloading::Error> {

        let deserializer =
        get_sym(&lib.lib, b"impl_deserialize_req")?;

        let serializer = 
        get_sym(&lib.lib, b"impl_serialize_resp")?;

        let resolver = 
        get_sym(&lib.lib, b"impl_resolve_req")?;

        Ok(Self::new(deserializer, serializer, resolver))
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

pub struct LibraryManager (Vec<PluginLibrary>);

impl<'l> LibraryManager {
    pub fn load_plugins(&'l self) -> Result<Vec<DnsPlugin<'l>>, libloading::Error> {

        self.0.iter().map(|lib| {
            DnsPlugin::load(lib)
        }).collect()
    }

    pub fn add_lib<P>(self, dir: P) -> Self 
    where PathBuf: From<P>
    {

        let Self ( mut libraries ) = self;

        let path = PathBuf::from(dir).join("plugin.so");

        libraries.push( PluginLibrary {
            _path: path.clone(),
            lib: unsafe { Library::new(path).unwrap() }
        });

        Self ( libraries )
    }

    pub fn new() -> Self {
        Self ( Vec::new() )
    }

}
