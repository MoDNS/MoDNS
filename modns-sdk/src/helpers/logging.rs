
use std::ffi::{c_char, CStr};

#[no_mangle]
pub extern "C" fn log_error(msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr)
    }.to_string_lossy();
    log::error!("{}", msg);
}

#[no_mangle]
pub extern "C" fn log_warn(msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr)
    }.to_string_lossy();
    log::warn!("{}", msg);
}

#[no_mangle]
pub extern "C" fn log_info(msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr)
    }.to_string_lossy();
    log::info!("{}", msg);
}

#[no_mangle]
pub extern "C" fn log_debug(msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr)
    }.to_string_lossy();
    log::debug!("{}", msg);
}

#[no_mangle]
pub extern "C" fn log_trace(msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr)
    }.to_string_lossy();
    log::trace!("{}", msg);
}
