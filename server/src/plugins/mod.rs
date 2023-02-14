
pub mod executors;
pub mod loaders;

type ListenerDeserializeFn = unsafe extern "C" fn(
    *const u8,
    usize,
    *mut modns_sdk::ffi::DnsMessage
) -> u8;

type ListenerSerializeFn = unsafe extern "C" fn(
    modns_sdk::ffi::DnsMessage,
    modns_sdk::ffi::ByteVector
) -> modns_sdk::ffi::ByteVector;

type ResolverFn = unsafe extern "C" fn(
    modns_sdk::ffi::DnsMessage,
    *mut modns_sdk::ffi::DnsMessage
) -> u8;

#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use modns_sdk::{ffi, safe};

    use super::loaders;

    const SAMPLE_REQUEST: &[u8; 29] = b"\x33\xfd\x01\x00\x00\x01\x00\x00\
                                        \x00\x00\x00\x00\x07\x65\x78\x61\
                                        \x6d\x70\x6c\x65\x03\x63\x6f\x6d\
                                        \x00\x00\x01\x00\x01";
    #[test]
    fn listener_plugin_deserializer_success() {

        let pm = loaders::LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"));

        let plugins = pm.load_plugins().unwrap();

        let test_response = plugins[0].deserialize(&SAMPLE_REQUEST[..]).unwrap();

        assert_eq!(
            test_response.header,
            ffi::DnsHeader{
                id: 0x33fd,
                is_response: false,
                opcode: ffi::DnsOpcode::Query,
                authoritative_answer: false,
                truncation: false,
                recursion_desired: true,
                recursion_available: false,
                response_code: ffi::DnsResponseCode::NoError,
                qdcount: 1,
                ancount: 0,
                nscount: 0,
                arcount: 0
            }
        );

        assert!(!test_response.question.is_null());
        assert!(test_response.answer.is_null());
        assert!(test_response.authority.is_null());
        assert!(test_response.additional.is_null());

        let safe_response: safe::DnsMessage = (*test_response).try_into().unwrap();

        assert_eq!(
            safe_response.question,
            vec![
                safe::DnsQuestion {
                    name: vec![String::from("example"), String::from("com")],
                    type_code: 1,
                    class_code: 1
                }
            ]
        )

    }

    #[test]
    fn listener_plugin_deserializer_failure() {
        let pm = loaders::LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"));

        let plugins = pm.load_plugins().unwrap();

        let test_response = plugins[0].deserialize(&SAMPLE_REQUEST[..20]);

        assert_eq!(
            test_response.unwrap_err(),
            super::executors::PluginExecutorError::ErrorCode(1),
            "Deserializer did not error on an invalid request"
        );
    }
}