use std::os::raw::c_char;

#[repr(C)]
#[derive(Debug)]
pub struct DnsHeader {
    pub id: u16,
    is_query: bool,
    opcode: DnsOpcode,
    authoritative_answer: bool,
    truncation: bool,
    recursion_desired: bool,
    recursion_available: bool,
    response_code: DnsResponseCode,
    qdcount: u16,
    ancount: u16,
    nscount: u16,
    arcount: u16
}

#[repr(C)]
#[derive(Debug)]
pub enum DnsOpcode {
    Query,
    InverseQuery,
    Status,
    Notify,
    Update,
    DSO
}

#[repr(C)]
#[derive(Debug)]
pub enum DnsResponseCode {
    NoError,
    FormatError,
    ServerFailure,
    NameError,
    NotImplemented,
    Refused
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsQuestion {
    name: [c_char; 255],
    type_code: u16,
    class_code: u16
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsResourceRecord {
    name: [c_char; 255],
    type_code: u16,
    class_code: u16,
    ttl: i32,
    rdlength: u16,
    rdata: DnsResourceData
}

#[repr(C)]
#[derive(Debug)]
pub enum DnsResourceData {
    A { address: [u8; 4] }
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsMessage {
    header: DnsHeader,
    question: *const DnsQuestion,
    answer: *const DnsResourceRecord,
    authority: *const DnsResourceRecord,
    additional: *const DnsResourceRecord
}

extern "C" {
    pub fn deserialize_req(req: *const u8, size: usize) -> DnsMessage;
}