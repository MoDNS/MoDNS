
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
    pub(crate) name: BytePtrVector,
    pub(crate) type_code: u16,
    pub(crate) class_code: u16,
    pub(crate) ttl: i32,
    pub(crate) rdlength: u16,
    pub(crate) rdata: DnsResourceData
}

impl Default for DnsResourceRecord {
    fn default() -> Self {
        Self {
            name: Default::default(),
            type_code: 0,
            class_code: 0,
            ttl: 0,
            rdlength: 0,
            rdata: Default::default()
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub enum DnsResourceData {
    A { address: [u8; 4] },
    AAAA { address: [u8; 16] },
    Ns { nsdname: BytePtrVector },
    Cname { cname: BytePtrVector },
    Ptr { ptrdname: BytePtrVector },
    Soa {
        mname: BytePtrVector,
        rname: BytePtrVector,
        serial: u32,
        refresh: u32,
        retry: u32,
        expire: u32,
        minimum: u32
    },
    Txt { txt_data: BytePtrVector },
    Other { rdata: ByteVector }
}

impl Default for DnsResourceData {
    fn default() -> Self {
        Self::A { address: [0u8; 4] }
    }
}

#[repr(C)]
#[derive(Debug)]
pub struct DnsMessage {
    pub id: u16,
    pub is_response: bool,
    pub opcode: u16,
    pub authoritative_answer: bool,
    pub truncation: bool,
    pub recursion_desired: bool,
    pub recursion_available: bool,
    pub response_code: u16,
    pub questions: QuestionVector,
    pub answers: RRVector,
    pub authorities: RRVector,
    pub additional: RRVector
}

#[repr(C)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DnsHeader {
    pub id: u16,
    pub is_response: bool,
    pub opcode: u16,
    pub authoritative_answer: bool,
    pub truncation: bool,
    pub recursion_desired: bool,
    pub recursion_available: bool,
    pub response_code: u16,
    pub qdcount: usize,
    pub ancount: usize,
    pub nscount: usize,
    pub arcount: usize
}

unsafe impl Send for DnsMessage {}

impl DnsMessage {
    pub fn with_error_code(code: u8) -> Self {
        let mut rv = Self::default();
        rv.response_code = code.into();
        rv
    }

    pub fn header(&self) -> DnsHeader {
        DnsHeader {
            id: self.id,
            is_response: self.is_response,
            opcode: self.opcode,
            authoritative_answer: self.authoritative_answer,
            truncation: self.truncation,
            recursion_desired: self.recursion_desired,
            recursion_available: self.recursion_available,
            response_code: self.response_code,
            qdcount: self.questions.size,
            ancount: self.answers.size,
            nscount: self.authorities.size,
            arcount: self.additional.size,
        }
    }

}

impl Default for DnsMessage {
    fn default() -> Self {
        Self {
            id: 0,
            is_response: false,
            opcode: 0,
            authoritative_answer: false,
            truncation: false,
            recursion_desired: false,
            recursion_available: false,
            response_code: 0,
            questions: QuestionVector::default(),
            answers: RRVector::default(),
            authorities: RRVector::default(),
            additional: RRVector::default()
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub struct ByteVector {
    pub ptr: *mut u8,
    pub size: usize,
    pub capacity: usize
}

impl Default for ByteVector {
    fn default() -> Self {
        Self {
            ptr: std::ptr::null_mut(),
            size: 0,
            capacity: 0
        }
    }
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

#[repr(C)]
#[derive(Debug)]
pub struct QuestionVector {
    pub ptr: *mut DnsQuestion,
    pub size: usize,
    pub capacity: usize
}

impl Default for QuestionVector {
    fn default() -> Self {
        Self {
            ptr: std::ptr::null_mut(),
            size: 0,
            capacity: 0
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub struct RRVector {
    pub ptr: *mut DnsResourceRecord,
    pub size: usize,
    pub capacity: usize
}

impl Default for RRVector {
    fn default() -> Self {
        Self {
            ptr: std::ptr::null_mut(),
            size: 0,
            capacity: 0
        }
    }
}

#[repr(C)]
#[derive(Debug)]
pub enum DatabaseInfo {
    SQLite {
        file: ByteVector,
    },

    Postgres {
        host: ByteVector,
        port: u16,
        username: ByteVector,
        password: ByteVector
    }
}
