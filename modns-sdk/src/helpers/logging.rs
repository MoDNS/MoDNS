
use std::ffi::{c_char, CStr};

use super::get_plugin_name;

#[no_mangle]
pub extern "C" fn modns_log(level: u8, msg_ptr: *const c_char) {
    let msg = unsafe {
        CStr::from_ptr(msg_ptr.cast())
    };

    match level {
        0 => log::error!(target: &format!("modns-plugin::{}", get_plugin_name()), "{}", msg.to_string_lossy()),
        1 => log::warn!(target: &format!("modns-plugin::{}", get_plugin_name()), "{}", msg.to_string_lossy()),
        2 => log::info!(target: &format!("modns-plugin::{}", get_plugin_name()), "{}", msg.to_string_lossy()),
        3 => log::debug!(target: &format!("modns-plugin::{}", get_plugin_name()), "{}", msg.to_string_lossy()),
        _ => log::trace!(target: &format!("modns-plugin::{}", get_plugin_name()), "{}", msg.to_string_lossy()),
    }
}

#[no_mangle]
pub extern "C" fn modns_log_error_ptr(msg_ptr: *const c_char, msg_len: usize) {

    let msg_slice = unsafe {
        std::slice::from_raw_parts(msg_ptr.cast(), msg_len)
    };

    match CStr::from_bytes_with_nul(msg_slice) {
        Ok(msg) => log::error!(target: &format!("modns-plugin::{}", get_plugin_name()),"{}", msg.to_string_lossy()),
        Err(e) => log::error!("A plugin attempted to log an error but something went wrong: {e}"),
    }
}

#[no_mangle]
pub extern "C" fn modns_log_warn_ptr(msg_ptr: *const c_char, msg_len: usize) {

    let msg_slice = unsafe {
        std::slice::from_raw_parts(msg_ptr.cast(), msg_len)
    };

    match CStr::from_bytes_with_nul(msg_slice) {
        Ok(msg) => log::warn!(target: &format!("modns-plugin::{}", get_plugin_name()),"{}", msg.to_string_lossy()),
        Err(e) => log::warn!("A plugin attempted to log a warning but something went wrong: {e}"),
    }
}

#[no_mangle]
pub extern "C" fn modns_log_info_ptr(msg_ptr: *const c_char, msg_len: usize) {

    let msg_slice = unsafe {
        std::slice::from_raw_parts(msg_ptr.cast(), msg_len)
    };

    match CStr::from_bytes_with_nul(msg_slice) {
        Ok(msg) => log::info!(target: &format!("modns-plugin::{}", get_plugin_name()),"{}", msg.to_string_lossy()),
        Err(e) => log::warn!("A plugin attempted to log information but something went wrong: {e}"),
    }
}

#[no_mangle]
pub extern "C" fn modns_log_debug_ptr(msg_ptr: *const c_char, msg_len: usize) {

    let msg_slice = unsafe {
        std::slice::from_raw_parts(msg_ptr.cast(), msg_len)
    };

    match CStr::from_bytes_with_nul(msg_slice) {
        Ok(msg) => log::debug!(target: &format!("modns-plugin::{}", get_plugin_name()),"{}", msg.to_string_lossy()),
        Err(e) => log::warn!("A plugin attempted to log debug information but something went wrong: {}", e),
    }
}

#[no_mangle]
pub extern "C" fn modns_log_trace_ptr(msg_ptr: *const c_char, msg_len: usize) {

    let msg_slice = unsafe {
        std::slice::from_raw_parts(msg_ptr.cast(), msg_len)
    };

    match CStr::from_bytes_with_nul(msg_slice) {
        Ok(msg) => log::trace!(target: &format!("modns-plugin::{}", get_plugin_name()),"{}", msg.to_string_lossy()),
        Err(e) => log::warn!("A plugin attempted to log trace information but something went wrong: {e}"),
    }
}
