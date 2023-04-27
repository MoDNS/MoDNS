
use pretty_assertions::assert_eq;
use std::{path::PathBuf, env};

use modns_sdk::types::{ffi::{self, ByteVector}, safe, conversion::{FfiType, FfiVector}};

use modnsd::{plugins::manager::PluginManager, ServerConfig};

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
    opcode: 0,
    authoritative_answer: false,
    truncation: false,
    recursion_desired: true,
    recursion_available: false,
    response_code: 0,
    qdcount: 1,
    ancount: 0,
    nscount: 0,
    arcount: 0,
};

fn init_logger() {
    let _ = env_logger::builder()
        .is_test(true)
        .filter_level(log::LevelFilter::Trace)
        .try_init();
}

#[test]
fn listener_plugin_decoder_success() {

    init_logger();

    let mut pm = PluginManager::new(ServerConfig::new());

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]).unwrap();

    log::debug!("Decoding request");
    let test_response = pm.decode(&SAMPLE_REQUEST[..]).unwrap();
    log::debug!("Request decoded");

    assert_eq!(test_response.header(), SAMPLE_REQUEST_HEADER);

    assert_eq!(test_response.questions.size, 1);
    assert_eq!(test_response.answers.size, 0);
    assert_eq!(test_response.authorities.size, 0);
    assert_eq!(test_response.additional.size, 0);

    let safe_response: safe::DnsMessage = test_response.try_safe().unwrap();

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

    log::debug!("Decoding response");
    let test_response = pm.decode(&SAMPLE_RESPONSE[..]).unwrap();
    log::debug!("Response decoded");

    assert_eq!(test_response.header(), SAMPLE_RESPONSE_HEADER);

    assert_eq!(test_response.questions.size, 1);
    assert_eq!(test_response.answers.size, 1);
    assert_eq!(test_response.authorities.size, 0);
    assert_eq!(test_response.additional.size, 1);

    let safe_response: safe::DnsMessage = test_response.try_safe().unwrap();

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
    init_logger();
    let mut pm = PluginManager::new(ServerConfig::new());

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]).unwrap();

    log::debug!("Decoding short request");
    let test_response = pm.decode(&SAMPLE_REQUEST[..20]);
    log::debug!("Short request decoded");

    assert_eq!(
        test_response.unwrap_err().error_code(),
        Some(1),
        "decoder did not error on an invalid request"
    );
}

#[test]
fn listener_plugin_encoder_success() {
    init_logger();
    let mut pm = PluginManager::new(ServerConfig::new());

    pm.search(&[PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins")]).unwrap();

    let message = Box::new(ffi::DnsMessage {
        id: SAMPLE_REQUEST_HEADER.id,
        is_response: SAMPLE_REQUEST_HEADER.is_response,
        opcode: SAMPLE_REQUEST_HEADER.opcode,
        authoritative_answer: SAMPLE_REQUEST_HEADER.authoritative_answer,
        truncation: SAMPLE_REQUEST_HEADER.truncation,
        recursion_desired: SAMPLE_REQUEST_HEADER.recursion_desired,
        recursion_available: SAMPLE_REQUEST_HEADER.recursion_available,
        response_code: SAMPLE_REQUEST_HEADER.response_code,
        questions: ffi::QuestionVector::from_safe_vec(vec![ffi::DnsQuestion {
            name: ffi::BytePtrVector{
                ptr: [ByteVector {
                    ptr: b"example".as_ptr() as *mut u8,
                    size: 7,
                    capacity: 7,
                }, ByteVector {
                        ptr: b"com".as_ptr() as *mut u8,
                        size: 3,
                        capacity: 3,
                    }].as_mut_ptr(),
                size: 2,
                capacity: 2,
            },
            type_code: 1,
            class_code: 1,
        }]),
        answers: ffi::RRVector::from_safe_vec(Vec::new()),
        authorities: ffi::RRVector::from_safe_vec(Vec::new()),
        additional: ffi::RRVector::from_safe_vec(Vec::new()),
        });

    log::debug!("Encoding message");
    let test_response = pm.encode(message).unwrap();
    log::debug!("Message encoded");

    assert_eq!(&test_response[..], SAMPLE_REQUEST);


}
