use std::net::{Ipv4Addr, Ipv6Addr};

#[derive(Debug)]
pub struct DnsHeader {
    pub id: u16,
    pub is_response: bool,
    pub opcode: DnsOpcode,
    pub authoritative_answer: bool,
    pub truncation: bool,
    pub recursion_desired: bool,
    pub recursion_available: bool,
    pub response_code: DnsResponseCode,
    pub qdcount: u16,
    pub ancount: u16,
    pub nscount: u16,
    pub arcount: u16
}

#[derive(Debug)]
pub enum DnsOpcode {
    Query,
    InverseQuery,
    Status,
    Notify,
    Update,
    DSO
}

#[derive(Debug)]
pub enum DnsResponseCode {
    NoError,
    FormatError,
    ServerFailure,
    NameError,
    NotImplemented,
    Refused
}

#[derive(Debug, PartialEq, Eq)]
pub struct DnsQuestion {
    pub name: Vec<String>,
    pub type_code: u16,
    pub class_code: u16
}

#[derive(Debug)]
pub struct DnsResourceRecord {
    pub name: String,
    pub type_code: u16,
    pub class_code: u16,
    pub ttl: i32,
    pub rdlength: u16,
    pub rdata: DnsResourceData
}

#[derive(Debug)]
pub enum DnsResourceData {
    A { address: Ipv4Addr },
    AAAA { address: Ipv6Addr },
    Ns { nsdname: Vec<String> },
    Cname { cname: Vec<String> },
    Ptr { ptrdname: Vec<String> },
    Soa {
        mname: Vec<String>,
        rname: Vec<String>,
        serial: u32,
        refresh: u32,
        retry: u32,
        expire: u32,
        minimum: u32
    },
    Txt { txt_data: Vec<String> },
    Other { rdata: Vec<u8> }
}

#[derive(Debug)]
pub struct DnsMessage {
    pub header: DnsHeader,
    pub question: Vec<DnsQuestion>,
    pub answer: Vec<DnsResourceRecord>,
    pub authority: Vec<DnsResourceRecord>,
    pub additional: Vec<DnsResourceRecord>
}

#[derive(Debug)]
pub struct SerializerResponse(*const u8, usize);
