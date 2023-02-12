use std::net::Ipv4Addr;

#[derive(Debug)]
pub struct DnsHeader {
    pub id: u16,
    pub is_query: bool,
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

#[derive(Debug)]
pub struct DnsQuestion {
    pub name: String,
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
    A { address: Ipv4Addr }
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
