pub mod memory;
pub mod logging;

use std::sync::Once;

static mut PLUGIN_NAME: String = String::new();
static INIT: Once = Once::new();

#[no_mangle]
pub extern "Rust" fn _init_modns_sdk(plugin_name: &str, logger: &'static dyn log::Log) -> Result<(), log::SetLoggerError> {

    log::set_logger(logger)?;

    log::set_max_level(log::LevelFilter::Trace);


    INIT.call_once(|| {
        unsafe {
            PLUGIN_NAME = plugin_name.to_string();
        }
    });

    log::trace!("Initialized sdk for plugin {}", get_plugin_name());

    Ok(())
}

pub fn get_plugin_name<'a>() -> &'a str {
    INIT.call_once(|| {
        unsafe {
            PLUGIN_NAME = String::from("uninitialized");
        }
    });

    unsafe { &PLUGIN_NAME }
}
