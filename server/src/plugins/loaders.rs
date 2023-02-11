
use super::DnsDeserializeFn;
use super::executors::DnsPlugin;
use libloading::{Symbol, Library};
use std::path::PathBuf;

/// Stores the dynamic library code that a plugin gets its symbols from
/// 
/// Must outlive the plugin, since the library's lifetime is
/// what actually controls the lifetime of the code referenced by plugins
pub(crate) struct PluginLibrary {
    pub(crate) path: PathBuf,
    pub(crate) lib: Library
}

impl<'l> PluginLibrary {
    pub fn load_plugin(&'l self) -> DnsPlugin {

        let deserializer: Symbol<DnsDeserializeFn> = unsafe { self.lib.get(b"deserialize_req").unwrap() };

        DnsPlugin { deserializer }
    }

    pub fn path(&self) -> PathBuf {
        self.path.clone()
    }
}

pub struct LibraryManager (Vec<PluginLibrary>);

impl<'l> LibraryManager {
    pub fn load_plugins(&'l self) -> Vec<DnsPlugin<'l>>{

        let mut plugins = Vec::with_capacity(self.0.len());

        for lib in self.0.iter() {
            plugins.push(lib.load_plugin())
        };

        plugins

    }

    pub fn add_lib<P>(self, dir: P) -> Self 
    where PathBuf: From<P>
    {

        let Self ( mut libraries ) = self;

        let path = PathBuf::from(dir).join("plugin.so");

        libraries.push( PluginLibrary {
            path: path.clone(),
            lib: unsafe { Library::new(path).unwrap() }
        });

        Self ( libraries )
    }

    pub fn new() -> Self {
        Self ( Vec::new() )
    }

}
