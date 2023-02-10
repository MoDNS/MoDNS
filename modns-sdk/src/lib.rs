

#[repr(C)]
#[derive(Debug)]
pub struct DnsHeader {
    pub dummy: bool
}

#[repr(C)]
pub struct DnsRR {
    dummy: bool,
    dummy2: u8
}

extern "C" {
    pub fn deserialize_req(req: *mut u8, size: usize) -> DnsHeader;
}