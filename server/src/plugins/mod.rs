
pub mod executors;
pub mod loaders;

type ListenerDeserializeFn = unsafe extern "C" fn(*const u8, usize, *mut modns_sdk::ffi::DnsMessage);


#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use modns_sdk::{ffi, safe};

    use super::loaders;

    #[test]
    fn single_plugin() {
        let pm = loaders::LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"));

        let plugins = pm.load_plugins();

        let mut test_val = vec![0u8; 2];

        let test_response = plugins[0].deserialize(test_val.as_mut_slice());

        println!("Recieved object: {:?}", test_response);

        println!("Decoded into: {:?}", <ffi::DnsMessage as TryInto<safe::DnsMessage>>::try_into(*test_response))
    }
}