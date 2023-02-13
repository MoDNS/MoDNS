
pub mod executors;
pub mod loaders;

type ListenerDeserializeFn = unsafe extern "C" fn(*const u8, usize, *mut modns_sdk::ffi::DnsMessage) -> u8;


#[cfg(test)]
mod test {
    use std::{path::PathBuf, env};

    use modns_sdk::{ffi, safe};

    use super::loaders;

    #[test]
    fn listener_plugin_deserializer() {

        let request = b"\x33\xfd\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x07\x65\x78\x61\
                                    \x6d\x70\x6c\x65\x03\x63\x6f\x6d\x00\x00\x01\x00\x01";

        let pm = loaders::LibraryManager::new()
        .add_lib(PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"));

        let plugins = pm.load_plugins();

        let test_response = plugins[0].deserialize(request.as_slice()).unwrap();

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
}