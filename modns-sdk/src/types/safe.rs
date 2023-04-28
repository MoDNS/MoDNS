use std::{net::{Ipv4Addr, Ipv6Addr}, path::PathBuf};

use serde::{Serialize, Deserialize};

#[derive(Debug, PartialEq, Eq)]
pub struct DnsQuestion {
    pub name: Vec<String>,
    pub type_code: u16,
    pub class_code: u16
}

#[derive(Debug)]
pub struct DnsResourceRecord {
    pub name: Vec<String>,
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
    pub id: u16,
    pub is_response: bool,
    pub opcode: u16,
    pub authoritative_answer: bool,
    pub truncation: bool,
    pub recursion_desired: bool,
    pub recursion_available: bool,
    pub response_code: u16,
    pub question: Vec<DnsQuestion>,
    pub answer: Vec<DnsResourceRecord>,
    pub authority: Vec<DnsResourceRecord>,
    pub additional: Vec<DnsResourceRecord>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseInfo {
    Sqlite(PathBuf),
    Postgres {
        host: String,
        port: u16,
        username: String,
        password: String
    }
}

