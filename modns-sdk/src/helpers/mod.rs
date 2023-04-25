pub mod memory;
pub mod logging;
pub mod database;
pub mod strings;

use std::sync::Once;

use crate::types::{ffi, safe, conversion::FfiType};

static mut PLUGIN_NAME: String = String::new();
static mut DATABASE: Option<ffi::DatabaseInfo> = None;
static INIT: Once = Once::new();

#[no_mangle]
pub extern "Rust" fn _init_modns_sdk(plugin_name: &str, logger: &'static dyn log::Log, database: safe::DatabaseInfo) -> Result<(), log::SetLoggerError> {

    log::set_logger(logger)?;

    log::set_max_level(log::LevelFilter::Trace);


    INIT.call_once(|| {
        unsafe {
            PLUGIN_NAME = plugin_name.to_string();

            DATABASE = Some(ffi::DatabaseInfo::from_safe(database))
        }
    });

    log::trace!("Initialized sdk for plugin {}", get_plugin_name());

    Ok(())
}

pub fn get_plugin_name() -> &'static str {
    INIT.call_once(|| {
        unsafe {
            PLUGIN_NAME = String::from("uninitialized");
        }
    });

    unsafe { &PLUGIN_NAME }
}

pub fn get_database() -> Option<&'static ffi::DatabaseInfo> {
    INIT.call_once(|| {
        unsafe {
            PLUGIN_NAME = String::from("uninitialized");
        }
    });

    unsafe { DATABASE.as_ref() }
}
