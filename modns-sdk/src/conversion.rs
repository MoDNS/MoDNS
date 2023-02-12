use std::{ffi::{c_char, CStr}, panic::catch_unwind, net::Ipv4Addr};

use super::{ffi, safe};

#[derive(Debug)]
pub enum FfiConversionError {
    InvalidString(*const c_char),
    InvalidNullPointer,
    InvalidEnum
}

impl TryFrom<ffi::DnsOpcode> for safe::DnsOpcode {
    type Error = FfiConversionError;

    fn try_from(value: ffi::DnsOpcode) -> Result<Self, Self::Error> {
        catch_unwind(|| {
            match value {
                ffi::DnsOpcode::Query => safe::DnsOpcode::Query,
                ffi::DnsOpcode::InverseQuery => safe::DnsOpcode::InverseQuery,
                ffi::DnsOpcode::Status => safe::DnsOpcode::Status,
                ffi::DnsOpcode::Notify => safe::DnsOpcode::Notify,
                ffi::DnsOpcode::Update => safe::DnsOpcode::Update,
                ffi::DnsOpcode::DSO => safe::DnsOpcode::DSO,
            }
        })
        .or(Err(FfiConversionError::InvalidEnum))
    }
}

impl TryFrom<ffi::DnsResponseCode> for safe::DnsResponseCode {
    type Error = FfiConversionError;

    fn try_from(value: ffi::DnsResponseCode) -> Result<Self, Self::Error> {
        catch_unwind(|| {
            match value {
                ffi::DnsResponseCode::NoError => safe::DnsResponseCode::NoError,
                ffi::DnsResponseCode::FormatError => safe::DnsResponseCode::FormatError,
                ffi::DnsResponseCode::ServerFailure => safe::DnsResponseCode::ServerFailure,
                ffi::DnsResponseCode::NameError => safe::DnsResponseCode::NameError,
                ffi::DnsResponseCode::NotImplemented => safe::DnsResponseCode::NotImplemented,
                ffi::DnsResponseCode::Refused => safe::DnsResponseCode::Refused,
            }
        })
        .or(Err(FfiConversionError::InvalidEnum))
    }
}

impl TryFrom<ffi::DnsResourceData> for safe::DnsResourceData {
    type Error = FfiConversionError;

    fn try_from(value: ffi::DnsResourceData) -> Result<Self, Self::Error> {
        match value {
            ffi::DnsResourceData::A { address } => Ok(safe::DnsResourceData::A { address: Ipv4Addr::from(address) }),
        }
    }
}

impl TryFrom<ffi::DnsMessage> for safe::DnsMessage {
    type Error = FfiConversionError;

    fn try_from(value: ffi::DnsMessage) -> Result<Self, Self::Error> {

        let ffi::DnsMessage {
            header: unsafe_header,
            question: unsafe_question,
            answer: unsafe_answer,
            authority: unsafe_authority,
            additional: unsafe_additional
        } = value;

        let ffi::DnsHeader {
            id,
            is_query,
            opcode: unsafe_opcode,
            authoritative_answer,
            truncation,
            recursion_desired,
            recursion_available,
            response_code: unsafe_response_code,
            qdcount,
            ancount,
            nscount,
            arcount,
        } = unsafe_header;

        let question = unsafe { question_ptr_to_safe_vec(unsafe_question, qdcount.into())}?;
        let answer = unsafe { rr_ptr_to_safe_vec(unsafe_answer, ancount.into())}?;
        let authority = unsafe { rr_ptr_to_safe_vec(unsafe_authority, nscount.into())}?;
        let additional = unsafe { rr_ptr_to_safe_vec(unsafe_additional, arcount.into())}?;

        let opcode = safe::DnsOpcode::try_from(unsafe_opcode)?;
        let response_code = safe::DnsResponseCode::try_from(unsafe_response_code)?;

        let header = safe::DnsHeader{
            id,
            is_query,
            opcode,
            authoritative_answer,
            truncation,
            recursion_desired,
            recursion_available,
            response_code,
            qdcount,
            ancount,
            nscount,
            arcount
        };

        Ok(safe::DnsMessage{ header, question, answer, authority, additional })
    }
}

unsafe fn question_ptr_to_safe_vec(ptr: *mut ffi::DnsQuestion, len: usize) -> Result<Vec<safe::DnsQuestion>, FfiConversionError> {

    Box::from_raw(
        std::ptr::slice_from_raw_parts_mut(ptr, len)
    )

    .into_iter().map(|q| {
        let &ffi::DnsQuestion { name: unsafe_name_ptr, type_code, class_code } = q;

        if unsafe_name_ptr.is_null() { return Err(FfiConversionError::InvalidString(unsafe_name_ptr)) };

        let name = String::from_utf8_lossy(CStr::from_ptr(unsafe_name_ptr).to_bytes()).to_string();

        Ok(safe::DnsQuestion { name, type_code, class_code })
    }).collect()
}

unsafe fn rr_ptr_to_safe_vec(ptr: *mut ffi::DnsResourceRecord, len: usize) -> Result<Vec<safe::DnsResourceRecord>, FfiConversionError> {

    Box::from_raw(
        std::ptr::slice_from_raw_parts_mut(ptr, len)
    )

    .into_iter().map(|r| {
        let &ffi::DnsResourceRecord{ name: unsafe_name_ptr, type_code, class_code, ttl, rdlength, rdata } = r;

        if unsafe_name_ptr.is_null() { return Err(FfiConversionError::InvalidString(unsafe_name_ptr)) };

        let name = String::from_utf8_lossy(CStr::from_ptr(unsafe_name_ptr).to_bytes()).to_string();

        Ok(safe::DnsResourceRecord { name, type_code, class_code, ttl, rdlength, rdata: safe::DnsResourceData::try_from(rdata)? })
    }).collect()
}