use std::mem;

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

/// Safely resize a field of the provided [DnsMessage] struct, and set the appropriate header field.
/// 
/// This funciton should always be used to add and remove fields to the message struct,
/// so that all memory that is persistent across calls to your plugin is handled consistently.
#[no_mangle]
pub extern "C" fn resize_field(msg_ptr: *mut ffi::DnsMessage, num: u16, field: DnsField) {
    let Some(msg) = (unsafe { msg_ptr.as_mut() }) else { return };

    match field {
        DnsField::Question => {
            let mut request_vec = if msg.question.is_null() {
                Vec::with_capacity(0)
            } else {
                unsafe {
                    Vec::from_raw_parts(
                        msg.question,
                        msg.header.qdcount.into(),
                        msg.header.qdcount.into()
                    )
                }
            };

            request_vec.resize_with(num.into(), Default::default);

            request_vec.shrink_to_fit();

            let mut request_vec = mem::ManuallyDrop::new(request_vec);

            msg.question = request_vec.as_mut_ptr();

            msg.header.qdcount = num;

        },
        DnsField::Answer => {
            let mut answer_vec = if msg.answer.is_null() {
                Vec::with_capacity(0)
            } else {
                unsafe {
                    Vec::from_raw_parts(
                        msg.answer,
                        msg.header.ancount.into(),
                        msg.header.ancount.into()
                    )
                }
            };

            answer_vec.resize_with(num.into(), Default::default);

            let mut answer_vec = mem::ManuallyDrop::new(answer_vec);

            msg.answer = answer_vec.as_mut_ptr();

            msg.header.ancount = num;
        },
        DnsField::Authority => {
            let mut auth_vec = if msg.answer.is_null() {
                Vec::with_capacity(0)
            } else {
                unsafe {
                    Vec::from_raw_parts(
                        msg.authority,
                        msg.header.nscount.into(),
                        msg.header.nscount.into()
                    )
                }
            };

            auth_vec.resize_with(num.into(), Default::default);

            let mut auth_vec = mem::ManuallyDrop::new(auth_vec);

            msg.answer = auth_vec.as_mut_ptr();

            msg.header.ancount = num;

        },
        DnsField::Additional => {
            let mut additional_vec = if msg.answer.is_null() {
                Vec::with_capacity(0)
            } else {
                unsafe {
                    Vec::from_raw_parts(
                        msg.additional,
                        msg.header.arcount.into(),
                        msg.header.arcount.into()
                    )
                }
            };

            additional_vec.resize_with(num.into(), Default::default);

            let mut additional_vec = mem::ManuallyDrop::new(additional_vec);

            msg.answer = additional_vec.as_mut_ptr();

            msg.header.ancount = num;

        },
    }
}

/// Reallocate memory for a buffer of chars so that it can fit `new_size` values
/// 
/// Returns the new pointer to the buffer, as well as the size that was actually allocated
/// 
/// If this function is run multiple times on the same buffer, `current_size` should always
/// be the actual size returned from the last call to this function
#[no_mangle]
pub extern "C" fn extend_char_vec(buf: ffi::ByteVector, num_to_add: usize) -> ffi::ByteVector {
    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    ffi::ByteVector::from(v)
}

#[no_mangle]
pub extern "C" fn extend_ptr_vec(buf: ffi::BytePtrVector, num_to_add: usize) -> ffi::BytePtrVector {
    let mut v = unsafe {
        Vec::from_raw_parts(buf.ptr, buf.size, buf.capacity)
    };

    v.reserve_exact(num_to_add);

    println!("Resized pointer vector to length {} and capacity {}.", v.len(), v.capacity());

    ffi::BytePtrVector::from(v)
}