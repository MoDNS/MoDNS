
use pretty_assertions::assert_eq;
use std::{path::PathBuf, env};

use modns_sdk::{ffi::{self, ByteVector}, safe};

use modnsd::plugins::manager::PluginManager;

const SAMPLE_REQUEST: &[u8; 29] = b"\xc3\xd9\x01\x00\x00\x01\x00\x00\
                                    \x00\x00\x00\x00\x07\x65\x78\x61\
                                    \x6d\x70\x6c\x65\x03\x63\x6f\x6d\
                                    \x00\x00\x01\x00\x01";

const SAMPLE_RESPONSE: &[u8; 56] = b"\x1e\x92\x81\xa0\x00\x01\x00\x01\
                                    \x00\x00\x00\x01\x07\x65\x78\x61\
                                    \x6d\x70\x6c\x65\x03\x63\x6f\x6d\
                                    \x00\x00\x01\x00\x01\xc0\x0c\x00\
                                    \x01\x00\x01\x00\x00\x20\xe8\x00\
                                    \x04\x5d\xb8\xd8\x22\x00\x00\x29\
                                    \x02\x00\x00\x00\x00\x00\x00\x00";

const SAMPLE_REQUEST_HEADER: ffi::DnsHeader = ffi::DnsHeader{
    id: 0xc3d9,
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
    arcount: 0,
};

const SAMPLE_RESPONSE_HEADER: ffi::DnsHeader = ffi::DnsHeader {
    id: 0x1e92,
    is_response: true,
    opcode: ffi::DnsOpcode::Query,
    authoritative_answer: false,
    truncation: false,
    recursion_desired: true,
    recursion_available: true,
    response_code: ffi::DnsResponseCode::NoError,
    qdcount: 1,
    ancount: 1,
    nscount: 0,
    arcount: 1,
};


#[test]
fn listener_plugin_decoder_success() {

    let mut pm = PluginManager::new();

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]);

    let test_response = pm.decode(&SAMPLE_REQUEST[..]).unwrap();

    assert_eq!(test_response.header, SAMPLE_REQUEST_HEADER);

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
    );

    let test_response = pm.decode(&SAMPLE_RESPONSE[..]).unwrap();

    assert_eq!(test_response.header, SAMPLE_RESPONSE_HEADER);

    assert!(!test_response.question.is_null());
    assert!(!test_response.answer.is_null());
    assert!(test_response.authority.is_null());
    assert!(!test_response.additional.is_null());

    println!("{test_response:?}");
    println!("answer: {:?}", unsafe { test_response.answer.as_ref() });
    println!("additional: {:?}", unsafe { test_response.additional.as_ref() });

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
fn listener_plugin_decoder_failure() {
    let mut pm = PluginManager::new();

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]);

    let test_response = pm.decode(&SAMPLE_REQUEST[..20]);

    assert_eq!(
        test_response.unwrap_err(),
        modnsd::plugins::plugin::PluginExecutorError::ErrorCode(1),
        "decoder did not error on an invalid request"
    );
}

#[test]
fn listener_plugin_encoder_success() {
    let mut pm = PluginManager::new();

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]);

    let message = Box::new(ffi::DnsMessage {
            header: SAMPLE_REQUEST_HEADER,
            question: &mut ffi::DnsQuestion {
                name: ffi::BytePtrVector{
                    ptr: [ByteVector {
                        ptr: b"example".as_ptr() as *mut i8,
                        size: 7,
                        capacity: 7,
                    }, ByteVector {
                        ptr: b"com".as_ptr() as *mut i8,
                        size: 3,
                        capacity: 3,
                    }].as_mut_ptr(),
                    size: 2,
                    capacity: 2,
                },
                type_code: 1,
                class_code: 1,
            },
            answer: std::ptr::null_mut(),
            authority: std::ptr::null_mut(),
            additional: std::ptr::null_mut(),
        });

    let test_response = pm.encode(message).unwrap();

    assert_eq!(unsafe{std::mem::transmute::<&[i8], &[u8]>(&test_response[..])}, SAMPLE_REQUEST);


}
