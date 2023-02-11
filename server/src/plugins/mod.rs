
pub mod executors;
pub mod loaders;

type DnsDeserializeFn = unsafe extern "C" fn(*mut u8, usize) -> modns_sdk::DnsHeader;

#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use super::loaders;

    #[test]
    fn single_plugin() {
        let pm = loaders::LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"));

        let plugins = pm.load_plugins();

        let mut test_val = vec![0u8; 2];

        let test_response = plugins[0].deserialize(test_val.as_mut_slice());

        println!("{:?}", test_response)
    }
}