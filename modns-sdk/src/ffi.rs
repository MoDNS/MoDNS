use std::os::raw::c_char;

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
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

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
pub enum DnsOpcode {
    Query,
    InverseQuery,
    Status,
    Notify,
    Update,
    DSO
}

#[repr(C)]
#[derive(Debug, PartialEq, Eq)]
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
    pub name: BytePtrVector,
    pub type_code: u16,
    pub class_code: u16
}

impl Default for DnsQuestion {
    fn default() -> Self {
        Self {
            name: Default::default(),
            type_code: 0,
            class_code: 0
        }
    }
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

impl Default for DnsResourceRecord {
    fn default() -> Self {
        Self {
            name: std::ptr::null(),
            type_code: 0,
            class_code: 0,
            ttl: 0,
            rdlength: 0,
            rdata: Default::default()
        }
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub enum DnsResourceData {
    A { address: [u8; 4] }
}

impl Default for DnsResourceData {
    fn default() -> Self {
        Self::A { address: [0u8; 4] }
    }
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsMessage {
    pub header: DnsHeader,
    pub question: *mut DnsQuestion,
    pub answer: *mut DnsResourceRecord,
    pub authority: *mut DnsResourceRecord,
    pub additional: *mut DnsResourceRecord
}

#[repr(C)]
#[derive(Debug)]
pub struct SerializerResponse(*const u8, usize);

impl Default for DnsHeader {
    fn default() -> Self {
        Self {
            id: 0,
            is_response: false,
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

#[repr(C)]
#[derive(Debug)]
pub struct ByteVector {
    pub ptr: *mut c_char,
    pub size: usize,
    pub capacity: usize
}

#[repr(C)]
#[derive(Debug)]
pub struct BytePtrVector {
    pub ptr: *mut ByteVector,
    pub size: usize,
    pub capacity: usize
}

impl Default for BytePtrVector {
    fn default() -> Self {
        Self {
            ptr: std::ptr::null_mut(),
            size: 0,
            capacity: 0
        }
    }
}