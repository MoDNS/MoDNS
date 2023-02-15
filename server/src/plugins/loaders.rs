
use super::executors::DnsPlugin;
use libloading::{Symbol, Library};
use std::{path::{PathBuf}, ffi::OsStr};

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

/// Stores the dynamic library code that a plugin gets its symbols from
/// 
/// Must outlive the plugin, since the library's lifetime is
/// what actually controls the lifetime of the code referenced by plugins
pub(crate) struct PluginLibrary {
    _home_dir: PathBuf,
    lib: Library
}

impl<'l> DnsPlugin<'l> {
    pub(crate) fn load(lib: &'l PluginLibrary) -> Result<Self, libloading::Error> {

        let decoder =
        get_sym(&lib.lib, b"impl_decode_req")?;

        let encoder = 
        get_sym(&lib.lib, b"impl_encode_resp")?;

        let resolver = 
        get_sym(&lib.lib, b"impl_resolve_req")?;

        Ok(Self::new(decoder, encoder, resolver))
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
    pub fn init(&'l self) -> Result<Vec<DnsPlugin<'l>>, libloading::Error> {

        self.0.iter().map(|lib| {
            DnsPlugin::load(lib)
        }).collect()
    }

    pub fn add_lib<P>(&mut self, path: &P) -> Result<(), PluginLoaderError>
    where P: Into<PathBuf> + AsRef<OsStr> + Clone
    {

        self.0.push( PluginLibrary {
            _home_dir: path.clone().into(),
            lib: unsafe { Library::new(path).unwrap() },
        });

        Ok(())
    }

    pub fn search(&mut self, search_path: &[PathBuf]) {
        for parent in search_path {

            match parent.read_dir() {
                Ok(dir_info) => {
                    let dirs = dir_info.filter_map(|d| {
                        match d {
                            Ok(f) if f.file_type().ok()?.is_dir()=> Some(f.path()),
                            Ok(_) => None,
                            Err(_) => None,
                        }
                    });

                    for subdir in dirs {
                        let so_path = subdir.join("plugin.so");

                        if !so_path.is_file() { continue; }

                        if let Err(e) = self.add_lib(&so_path) {
                            log::error!("Failed to load library at {}: {e:?}", so_path.display())
                        }
                    }
                },
                Err(e) => {
                    log::info!("Failed to read directory {}: {}", parent.display(), e);
                },
            }
        }
    }

    pub fn clear(&mut self) {
        self.0.clear();
    }

    pub const fn new() -> Self {
        Self ( Vec::new() )
    }

}
