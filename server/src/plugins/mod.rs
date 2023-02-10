use std::path::PathBuf;
use libloading::{Library, Symbol};

type DnsDeserializeFn = unsafe extern "C" fn(*mut u8, usize) -> modns_sdk::DnsHeader;

/// A Plugin which contains symbols for functions that are called during
/// the DNS resolving process.
pub struct DnsPlugin<'lib> {
    deserializer: Symbol<'lib, DnsDeserializeFn>
}

impl DnsPlugin<'_> {
    pub fn deserialize(&self, buf: &'_ mut [u8]) -> modns_sdk::DnsHeader {

        let f = &self.deserializer;

        unsafe {f(buf.as_mut_ptr(), buf.len())}
    }
}

/// Stores the dynamic library code that a plugin gets its symbols from
/// 
/// Must outlive the plugin, since the library's lifetime is
/// what actually controls the lifetime of the code referenced by plugins
struct PluginLibrary {
    path: PathBuf,
    lib: Library
}

pub struct LibraryManager (Vec<PluginLibrary>);

impl<'l> LibraryManager {
    pub fn load_plugins(&'l self) -> Vec<DnsPlugin<'l>>{

        let mut plugins = Vec::with_capacity(self.0.len());

        for lib in self.0.iter() {
            let deserializer: Symbol<DnsDeserializeFn> = unsafe { lib.lib.get(b"deserialize_req").unwrap() };

            plugins.push(DnsPlugin { deserializer })
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

#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use super::LibraryManager;


    #[test]
    fn single_plugin() {
        let pm = LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base"));

        let plugins = pm.load_plugins();

        let mut test_val = vec![0u8; 2];

        let test_response = plugins[0].deserialize(test_val.as_mut_slice());

        println!("{:?}", test_response)
    }
}