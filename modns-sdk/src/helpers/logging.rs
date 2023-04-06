
use std::ffi::{c_char, CStr};

use super::get_plugin_name;

#[no_mangle]
pub extern "C" fn modns_log_cstr(level: u8, msg_ptr: *const c_char) {
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
