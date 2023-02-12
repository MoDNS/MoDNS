use std::os::raw::c_char;

#[repr(C)]
#[derive(Debug)]
pub struct DnsHeader {
    pub id: u16,
    pub(crate) is_query: bool,
    pub(crate) opcode: DnsOpcode,
    pub(crate) authoritative_answer: bool,
    pub(crate) truncation: bool,
    pub(crate) recursion_desired: bool,
    pub(crate) recursion_available: bool,
    pub(crate) response_code: DnsResponseCode,
    pub(crate) qdcount: u16,
    pub(crate) ancount: u16,
    pub(crate) nscount: u16,
    pub(crate) arcount: u16
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
    pub(crate) name: *const c_char,
    pub(crate) type_code: u16,
    pub(crate) class_code: u16
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsResourceRecord {
    pub(crate) name: *const c_char,
    pub(crate) type_code: u16,
    pub(crate) class_code: u16,
    pub(crate) ttl: i32,
    pub(crate) rdlength: u16,
    pub(crate) rdata: DnsResourceData
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub enum DnsResourceData {
    A { address: [u8; 4] }
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsMessage {
    pub(crate) header: DnsHeader,
    pub(crate) question: *mut DnsQuestion,
    pub(crate) answer: *mut DnsResourceRecord,
    pub(crate) authority: *mut DnsResourceRecord,
    pub(crate) additional: *mut DnsResourceRecord
}

#[repr(C)]
#[derive(Debug)]
pub struct SerializerResponse(*const u8, usize);

impl Default for DnsHeader {
    fn default() -> Self {
        Self {
            id: 0,
            is_query: false,
            opcode: DnsOpcode::Query,
            authoritative_answer: false,
            truncation: false,
            recursion_desired: false,
            recursion_available: false,
            response_code: DnsResponseCode::NotImplemented,
            qdcount: 0,
            ancount: 0,
            nscount: 0,
            arcount: 0
        }
    }
}

impl Default for DnsMessage {
    fn default() -> Self {
        Self {
            header: Default::default(),
            question: std::ptr::null_mut(),
            answer: std::ptr::null_mut(),
            authority: std::ptr::null_mut(),
            additional: std::ptr::null_mut()
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub enum SectionToAdd {
    Question,
    Answer,
    Authority,
    Additional
}
