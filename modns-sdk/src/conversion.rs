use std::{ffi::{c_char, CStr}, mem};
use std::net::Ipv4Addr;
use std::panic::catch_unwind;

use super::{ffi, safe};

#[derive(Debug, PartialEq, Eq)]
pub enum FfiConversionError {
    InvalidString(*const c_char),
    UnexpectedNullPointer,
    ExpectedNullPointer,
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
            is_response,
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
            is_response,
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

    if len > 0 && ptr.is_null() { return Err(FfiConversionError::UnexpectedNullPointer);}

    Vec::from_raw_parts(ptr, len, len)

    .into_iter().map(|q| {
        let ffi::DnsQuestion { name: unsafe_name_vec, type_code, class_code } = q;

        let name = Vec::from_raw_parts(
            unsafe_name_vec.ptr,
            unsafe_name_vec.size,
            unsafe_name_vec.capacity
        ).into_iter().map(|ptr| {
            String::from_utf8_lossy(CStr::from_ptr(ptr.ptr).to_bytes()).into()
        }).collect();

        Ok(safe::DnsQuestion { name, type_code, class_code })
    }).collect()
}

unsafe fn rr_ptr_to_safe_vec(ptr: *mut ffi::DnsResourceRecord, len: usize) -> Result<Vec<safe::DnsResourceRecord>, FfiConversionError> {

    if len > 0 && ptr.is_null() { return Err(FfiConversionError::UnexpectedNullPointer);}

    Vec::from_raw_parts(ptr, len, len)

    .into_iter().map(|q| {
        let ffi::DnsResourceRecord{
            name: unsafe_name_vec,
            type_code,
            class_code,
            ttl,
            rdlength,
            rdata: unsafe_rdata
        } = q;

        let name = Vec::from_raw_parts(
            unsafe_name_vec.ptr,
            unsafe_name_vec.size,
            unsafe_name_vec.capacity
        ).into_iter().map(|ptr| {
            String::from_utf8_lossy(CStr::from_ptr(ptr.ptr).to_bytes())
        }).collect();

        let rdata = safe::DnsResourceData::try_from(unsafe_rdata)?;

        Ok(safe::DnsResourceRecord{ name, type_code, class_code, ttl, rdlength, rdata })
    }).collect()
}

impl From<Vec<c_char>> for ffi::ByteVector {
    fn from(value: Vec<c_char>) -> Self {
        let mut v = mem::ManuallyDrop::new(value);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl From<Vec<ffi::ByteVector>> for ffi::BytePtrVector {
    fn from(value: Vec<ffi::ByteVector>) -> Self {
        let mut v = mem::ManuallyDrop::new(value);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl TryInto<Vec<c_char>> for ffi::ByteVector {
    type Error = FfiConversionError;

    fn try_into(self) -> Result<Vec<c_char>, Self::Error> {
        if self.ptr.is_null() && self.size > 0 {
            return Err(FfiConversionError::UnexpectedNullPointer);
        }

        unsafe { Ok(Vec::from_raw_parts(self.ptr, self.size, self.capacity)) }
    }
}