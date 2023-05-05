
use std::ffi::CStr;

use crate::types::{ffi::ByteVector, conversion::FfiVector};

/// Duplicate the null-terminated string `src` into ByteVec `dest`, without
/// the null terminator.
///
/// `dest` will be resized to match new size.
///
/// Returns new size of `dest`
#[no_mangle]
pub extern "C" fn modns_strdup_to_bytevec(src: *mut i8, dest: &mut ByteVector) -> usize {
    // Cast to whatever signedness this arch uses for string pointers
    log::debug!("Checking string");
    let src_str = unsafe { CStr::from_ptr(src.cast_const().cast()) };

    // Drop the old string
    if !dest.ptr.is_null() {
        log::debug!("Dropping old string");
        let _ = unsafe { Vec::from_raw_parts(dest.ptr, dest.size, dest.capacity) };
    }

    log::debug!("Generating new string");
    let dest_str = src_str.to_string_lossy().to_string().into_bytes();

    log::debug!("Replacing destination");
    // Replace the elements of `dest`
    *dest = ByteVector::from_safe_vec(dest_str);

    log::debug!("Returning");

    dest.len()
}

/// Duplicate the contents of ByteVec `src` into nul terminated string `dest`.
///
/// `dest` should have enough space to store the new null terminated string.
///
/// `dest_capacity` should be the allocated capacity of `dest`
///
/// Returns number of bytes written to `dest`
#[no_mangle]
pub extern "C" fn modns_strdup_from_bytevec(src: &ByteVector, dest: *mut u8, dest_capacity: usize) -> usize {

    if src.len() + 1 > dest_capacity {
        return 0;
    }

    let Ok(offset) = src.len().try_into() else {
        return 0;
    };

    unsafe {
        std::ptr::copy(src.as_mut_ptr(), dest, src.len());
        std::ptr::write(dest.wrapping_offset(offset), 0u8);
    };

    (offset + 1).try_into().unwrap_or(0)
}

/// Create a new `ByteVector` with the designated `capacity`
#[no_mangle]
pub extern "C" fn modns_alloc_bytevec(capacity: usize) -> ByteVector {
    let s = String::with_capacity(capacity);

    ByteVector::from_safe_vec(s.into_bytes())
}

/// Destroy a `ByteVector`
#[no_mangle]
pub extern "C" fn modns_free_bytevec(item: ByteVector) {
    let _ = unsafe {
        item.try_safe_vec()
    };
}
