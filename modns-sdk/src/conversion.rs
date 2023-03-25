
use std::{net::Ipv6Addr, mem};
use std::ffi::c_char;
use std::string::FromUtf8Error;
use std::mem::ManuallyDrop;
use std::net::Ipv4Addr;
use std::panic::catch_unwind;

use crate::ffi::RRVector;

use super::{ffi, safe};

#[derive(Debug, PartialEq, Eq)]
pub enum FfiConversionError {
    InvalidNulTermString(*const c_char),
    InvalidVectorizedString(FromUtf8Error),
    UnexpectedNullPointer,
    ExpectedNullPointer,
    InvalidEnum
}

unsafe impl Send for FfiConversionError {}

unsafe impl Sync for FfiConversionError {}

trait FfiType {
    type Safe;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError>; 
    fn from_safe(safe_val: Self::Safe) -> Self;
}

/// Types which are an FFI-safe vector struct for a given item
trait FfiVector: Sized {
    type Item: Default;

    fn as_mut_ptr(&self) -> *mut Self::Item;
    fn len(&self) -> usize;
    fn capacity(&self) -> usize;
    fn from_safe_vec(v: Vec<Self::Item>) -> Self;

    unsafe fn try_safe_vec(self) -> Result<Vec<Self::Item>, FfiConversionError> {
        if self.as_mut_ptr().is_null() && self.capacity() > 0 {
            return Err(FfiConversionError::UnexpectedNullPointer)
        };

        Ok(Vec::from_raw_parts(self.as_mut_ptr(), self.len(), self.capacity()))
    }

    unsafe fn resize(vec: &mut Self, new_size: usize) -> Option<Self> {
        if vec.as_mut_ptr().is_null() && vec.capacity() > 0 {
            return None
        }

        let v = unsafe {
            Vec::from_raw_parts(vec.as_mut_ptr(), vec.len(), vec.capacity())
        };

        v.resize_with(new_size, Default::default);
        
        Some(Self::from_safe_vec(v))
    }
}

/// FFI Vectors of FFI types can become safe vectors of safe types
impl<T, S> FfiType for T where 
T: FfiVector<Item = S>,
S: FfiType
{
    type Safe = Vec<S::Safe>;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        unsafe { self.try_safe_vec() }?
            .into_iter()
            .map(FfiType::try_safe)
            .collect()

    }

    fn from_safe(safe_val: Self::Safe) -> Self {
        let v = safe_val.into_iter()
            .map(FfiType::from_safe)
            .collect();

        Self::from_safe_vec(v)
    }
}

impl FfiType for ffi::DnsOpcode {
    type Safe = safe::DnsOpcode;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        catch_unwind(|| {
            match self {
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

    fn from_safe(safe_val: Self::Safe) -> Self {
        match safe_val {
            safe::DnsOpcode::Query => ffi::DnsOpcode::Query,
            safe::DnsOpcode::InverseQuery => ffi::DnsOpcode::InverseQuery,
            safe::DnsOpcode::Status => ffi::DnsOpcode::Status,
            safe::DnsOpcode::Notify => ffi::DnsOpcode::Notify,
            safe::DnsOpcode::Update => ffi::DnsOpcode::Update,
            safe::DnsOpcode::DSO => ffi::DnsOpcode::DSO,
        }
    }
}

impl FfiType for ffi::DnsResponseCode {
    type Safe = safe::DnsResponseCode;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        catch_unwind(|| {
            match self {
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

    fn from_safe(safe_val: Self::Safe) -> Self {
        match safe_val {
            safe::DnsResponseCode::NoError => ffi::DnsResponseCode::NoError,
            safe::DnsResponseCode::FormatError => ffi::DnsResponseCode::FormatError,
            safe::DnsResponseCode::ServerFailure => ffi::DnsResponseCode::ServerFailure,
            safe::DnsResponseCode::NameError => ffi::DnsResponseCode::NameError,
            safe::DnsResponseCode::NotImplemented => ffi::DnsResponseCode::NotImplemented,
            safe::DnsResponseCode::Refused => ffi::DnsResponseCode::Refused,
        }
    }
}

impl FfiType for ffi::DnsResourceData {
    type Safe = safe::DnsResourceData;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        match self {
            ffi::DnsResourceData::A { address } => Ok(safe::DnsResourceData::A { address: Ipv4Addr::from(address) }),
            ffi::DnsResourceData::AAAA { address } => Ok(safe::DnsResourceData::AAAA { address: Ipv6Addr::from(address) }),
            ffi::DnsResourceData::Ns { nsdname } => Ok(safe::DnsResourceData::Ns { nsdname: nsdname.try_into()? }),
            ffi::DnsResourceData::Cname { cname } => Ok(safe::DnsResourceData::Cname { cname: cname.try_into()? }),
            ffi::DnsResourceData::Ptr { ptrdname } => Ok(safe::DnsResourceData::Ptr { ptrdname: ptrdname.try_into()? }),
            ffi::DnsResourceData::Soa {
                mname,
                rname,
                serial,
                refresh,
                retry,
                expire,
                minimum
            } => Ok(safe::DnsResourceData::Soa {
                mname: mname.try_into()?,
                rname: rname.try_into()?,
                serial,
                refresh,
                retry,
                expire,
                minimum
            }),
            ffi::DnsResourceData::Txt { txt_data } => Ok(safe::DnsResourceData::Txt { txt_data: txt_data.try_into()? }),
            ffi::DnsResourceData::Other { rdata } => unsafe { Ok(safe::DnsResourceData::Other { rdata: rdata.try_safe_vec()? }) }
        }
    }

    fn from_safe(safe_val: Self::Safe) -> Self {
        todo!()
    }
}

impl FfiType for ffi::DnsMessage {
    type Safe = safe::DnsMessage;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {

        let ffi::DnsMessage {
            id,
            is_response,
            opcode: unsafe_opcode,
            authoritative_answer,
            truncation,
            recursion_desired,
            recursion_available,
            response_code: unsafe_response_code,
            questions: unsafe_question,
            answers: unsafe_answer,
            authorities: unsafe_authority,
            additional: unsafe_additional
        } = self;

        let question = unsafe{ unsafe_question.try_safe()? };
        let answer = unsafe{ unsafe_answer.try_safe()? };
        let authority = unsafe{ unsafe_authority.try_safe()? };
        let additional = unsafe{ unsafe_additional.try_safe()? };

        let opcode = unsafe_opcode.try_safe()?;
        let response_code = unsafe_response_code.try_safe()?;

        Ok(safe::DnsMessage{
            id,
            is_response,
            opcode,
            authoritative_answer,
            truncation,
            recursion_desired,
            recursion_available,
            response_code,
            question,
            answer,
            authority,
            additional
        })
    }

    fn from_safe(safe_val: Self::Safe) -> Self {
        todo!()
    }
}

impl From<&[u8]> for ffi::ByteVector {
    fn from(value: &[u8]) -> Self {
        Self { ptr: value.as_mut_ptr(), size: value.len(), capacity: value.len() }
    }
}

impl FfiVector for ffi::ByteVector {
    type Item = u8;

    fn as_mut_ptr(&self) -> *mut Self::Item {
        self.ptr
    }

    fn len(&self) -> usize {
        self.size
    }

    fn capacity(&self) -> usize {
        self.capacity
    }

    fn from_safe_vec(v: Vec<Self::Item>) -> Self {
        let mut v = ManuallyDrop::new(v);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl FfiVector for ffi::BytePtrVector {
    type Item = ffi::ByteVector;

    fn as_mut_ptr(&self) -> *mut Self::Item {
        self.ptr
    }

    fn len(&self) -> usize {
        self.size
    }

    fn capacity(&self) -> usize {
        self.capacity
    }

    fn from_safe_vec(v: Vec<Self::Item>) -> Self {
        let mut v = ManuallyDrop::new(v);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl TryInto<String> for ffi::ByteVector {
    type Error = FfiConversionError;

    fn try_into(self) -> Result<String, Self::Error> {
        String::from_utf8(unsafe {
            self.try_safe_vec()?  
        })
            .map_err(|e| FfiConversionError::InvalidVectorizedString(e))
    }
}

impl TryInto<Vec<String>> for ffi::BytePtrVector {
    type Error = FfiConversionError;

    fn try_into(self) -> Result<Vec<String>, Self::Error> {
        unsafe {
            self.try_safe_vec()?
        }
            .into_iter().map(TryInto::try_into)
            .collect()
    }
}

impl FfiVector for ffi::QuestionVector {
    type Item = ffi::DnsQuestion;

    fn as_mut_ptr(&self) -> *mut Self::Item {
        self.ptr
    }

    fn len(&self) -> usize {
        self.size
    }

    fn capacity(&self) -> usize {
        self.capacity
    }

    fn from_safe_vec(v: Vec<Self::Item>) -> Self {
        let mut v = ManuallyDrop::new(v);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl FfiType for ffi::DnsQuestion {
    type Safe = safe::DnsQuestion;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        let Self { name: unsafe_name_vec, type_code, class_code } = self;

        let name = unsafe{ unsafe_name_vec.try_safe_vec()? }
            .into_iter().map(TryInto::try_into)
            .collect::<Result<Vec<String>, FfiConversionError>>()?;

        Ok(safe::DnsQuestion { name, type_code, class_code })
    }

    fn from_safe(safe_val: Self::Safe) -> Self {
        todo!()
    }
}

impl FfiVector for RRVector {
    type Item = ffi::DnsResourceRecord;

    fn as_mut_ptr(&self) -> *mut Self::Item {
        self.ptr
    }

    fn len(&self) -> usize {
        self.size
    }

    fn capacity(&self) -> usize {
        self.capacity
    }

    fn from_safe_vec(v: Vec<Self::Item>) -> Self {
        let mut v = ManuallyDrop::new(v);

        Self { ptr: v.as_mut_ptr(), size: v.len(), capacity: v.capacity() }
    }
}

impl FfiType for ffi::DnsResourceRecord {
    type Safe = safe::DnsResourceRecord;

    fn try_safe(self) -> Result<Self::Safe, FfiConversionError> {
        
        let Self { name: unsafe_name_vec, type_code, class_code, ttl, rdlength, rdata: unsafe_rdata } = self;

        let name = unsafe {
            unsafe_name_vec.try_into()?
        };

        let rdata = unsafe {
            unsafe_rdata.try_safe()?
        };

        Ok(
            safe::DnsResourceRecord { name, type_code, class_code, ttl, rdlength, rdata }
        )
    }

    fn from_safe(safe_val: Self::Safe) -> Self {
        todo!()
    }
}

impl TryInto<safe::DnsResourceRecord> for ffi::DnsResourceRecord {
    type Error = FfiConversionError;

    fn try_into(self) -> Result<safe::DnsResourceRecord, Self::Error> {
        
        let Self { name: unsafe_name_vec, type_code, class_code, ttl, rdlength, rdata: unsafe_rdata } = self;

        let name = unsafe_name_vec.try_into()?;

        let rdata = unsafe_rdata.try_safe()?;

        Ok(
            safe::DnsResourceRecord { name, type_code, class_code, ttl, rdlength, rdata }
        )

    }
}

