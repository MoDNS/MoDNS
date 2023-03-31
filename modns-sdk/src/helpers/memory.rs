use std::mem;

use crate::types::{ffi::{QuestionVector, RRVector}, conversion::FfiVector};

use crate::types::ffi;

//@ Helper functions exposed to the C api that allows for all data that pass the FFI
//@ boundary to have their memory managed by the Rust allocator.

#[repr(C)]
#[derive(Debug)]
pub enum DnsField {
    Question,
    Answer,
    Authority,
    Additional
}

/// Safely resize the provided [QuestionVector]
/// 
/// This funciton should always be used to add and remove fields to the message struct,
/// so that all memory that is persistent across calls to your plugin is handled consistently.
#[no_mangle]
pub extern "C" fn resize_question_field(field: &mut QuestionVector, new_size: usize) -> bool {

    let Some(vec) = (unsafe {
        FfiVector::resize(field, new_size)
    }) else {return false};   

    *field = vec;

    true

}

/// Safely resize the provided [RRVector]
/// 
/// This funciton should always be used to add and remove fields to the message struct,
/// so that all memory that is persistent across calls to your plugin is handled consistently.
#[no_mangle]
pub extern "C" fn resize_rr_field(field: &mut RRVector, new_size: usize) -> bool {


    let Some(vec) = (unsafe {
        FfiVector::resize(field, new_size)
    }) else {return false};   

    *field = vec;

    true


}

/// Reallocate memory for a buffer of chars so that it can fit `new_size` values
/// 
/// Returns the new pointer to the buffer, as well as the size that was actually allocated
/// 
/// If this function is run multiple times on the same buffer, `current_size` should always
/// be the actual size returned from the last call to this function
#[no_mangle]
pub extern "C" fn extend_char_vec(buf: ffi::ByteVector, num_to_add: usize) -> ffi::ByteVector {

    if buf.ptr.is_null() {
        return ffi::ByteVector::from_safe_vec(Vec::with_capacity(num_to_add));
    }

    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    ffi::ByteVector::from_safe_vec(v)
}

#[no_mangle]
pub extern "C" fn extend_ptr_vec(buf: ffi::BytePtrVector, num_to_add: usize) -> ffi::BytePtrVector {

    if buf.ptr.is_null() {
        return ffi::BytePtrVector::from_safe_vec(Vec::with_capacity(num_to_add));
    }

    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    ffi::BytePtrVector::from_safe_vec(v)
}

#[no_mangle]
pub extern "C" fn drop_char_vec(buf: ffi::ByteVector) {

    if buf.ptr.is_null() {return}

    let v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    mem::drop(v)
}

#[no_mangle]
pub extern "C" fn drop_ptr_vec(buf: ffi::BytePtrVector) {
    if buf.ptr.is_null() {return}

    let v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    mem::drop(v);
}
