use std::path::PathBuf;
use libloading::{Library, Symbol};

type DnsDeserializeFn = unsafe extern "C" fn(*mut u8, usize) -> modns_sdk::DnsHeader;

pub struct DnsPlugin<'lib> {
    deserializer: Symbol<'lib, DnsDeserializeFn>
}

impl DnsPlugin<'_> {
    pub fn call_deserializer(&self, buf: &'_ mut [u8]) -> modns_sdk::DnsHeader {

        let f = &self.deserializer;

        unsafe {f(buf.as_mut_ptr(), buf.len())}
    }
}

pub struct LibraryManager {
    libraries: Vec<Library>
}

impl<'l> LibraryManager {
    pub fn get_plugins(&'l mut self) -> Vec<DnsPlugin<'l>>{

        let mut plugins = Vec::new();

        for lib in self.libraries.iter() {
            let deserializer: Symbol<DnsDeserializeFn> = unsafe { lib.get(b"deserialize_req").unwrap() };

            plugins.push(DnsPlugin { deserializer })
        };

        plugins

    }

    pub fn with_lib<P>(self, dir: P) -> Self 
    where PathBuf: From<P>
    {

        let Self { mut libraries } = self;

        let path = PathBuf::from(dir).join("plugin.so");

        libraries.push( unsafe {
            Library::new(path).unwrap()
        });

        Self { libraries }
    }

    pub fn new() -> Self {
        Self { libraries: Vec::new() }
    }

}

#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use super::LibraryManager;


    #[test]
    fn single_plugin() {
        let mut pm = LibraryManager::new()
        .with_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base"));

        let plugins = pm.get_plugins();

        let mut test_val = vec![0u8; 2];

        let test_response = plugins[0].call_deserializer(test_val.as_mut_slice());

        println!("{:?}", test_response)
    }
}