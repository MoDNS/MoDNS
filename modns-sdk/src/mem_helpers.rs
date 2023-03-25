use std::mem;

use crate::ffi::{QuestionVector, RRVector};

use super::ffi;

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

    let Ok(mut request_vec) = Vec::try_from(*field) else { return false };

    request_vec.resize_with(new_size, Default::default);

    request_vec.shrink_to_fit();

    let mut request_vec = mem::ManuallyDrop::new(request_vec);

    *field = QuestionVector::from(*request_vec);

    true

}

/// Safely resize the provided [RRVector]
/// 
/// This funciton should always be used to add and remove fields to the message struct,
/// so that all memory that is persistent across calls to your plugin is handled consistently.
#[no_mangle]
pub extern "C" fn resize_rr_field(field: *mut RRVector, new_size: usize) -> bool {

    let Some(field) = (unsafe {
        field.as_mut()
    }) else { return false };

    let Ok(mut v) = Vec::try_from(field) else { return false };

    v.resize_with(new_size, Default::default);

    v.shrink_to_fit();

    let mut v = mem::ManuallyDrop::new(v);

    *field = RRVector::from(*v);

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
        return ffi::ByteVector::from(Vec::with_capacity(num_to_add));
    }

    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    ffi::ByteVector::from(v)
}

#[no_mangle]
pub extern "C" fn extend_ptr_vec(buf: ffi::BytePtrVector, num_to_add: usize) -> ffi::BytePtrVector {

    if buf.ptr.is_null() {
        return ffi::BytePtrVector::from(Vec::with_capacity(num_to_add));
    }

    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    ffi::BytePtrVector::from(v)
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
