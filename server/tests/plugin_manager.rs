use std::{path::PathBuf, env};

use modnsd::{plugins::manager::PluginManager, ServerConfig};


#[test]
fn plugins_init() {
    env_logger::builder()
        .is_test(true)
        .filter_level(log::LevelFilter::Trace)
        .init();

    log::info!("Starting test");
    let mut pm = PluginManager::new(ServerConfig::empty());

    log::info!("Loading plugins");
    let listener = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base-listener"),
        false
    ).expect("Failed to load listener");
    log::info!("Listener loaded");

    let resolver = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base-resolver"),
        false
    ).expect("Failed to load resolver");
    log::info!("Resolver loaded");

    assert!(!pm.get_metadata(&listener).unwrap().enabled(), "Listener is enabled before being initialized");
    assert!(!pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is enabled before being initialized");

    log::info!("Initializing plugins");
    pm.init().expect("PluginManager failed to initialize");
    log::info!("Plugins Initialized");

    assert!(pm.get_metadata(&listener).unwrap().enabled(), "Listener is disabled after Pluginmanager::init()");
    assert!(pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is disabled after Pluginmanager::init()");
    pm.is_valid_state(true).expect("PluginManager is reporting an invalid state even though it should be valid");

    pm.disable_plugin(&resolver).expect("Failed to disable resolver");

    assert!(!pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is enabled after user attempted to disable it");
    pm.is_valid_state(true).expect_err("PluginManager is reporting a valid state even though no resolvers are enabled");

    pm.enable_plugin(&resolver).expect("Failed to enable resolver");

    assert!(pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is disabled after user attempted to enable it");
    pm.is_valid_state(true).expect("PluginManager is reporting an invalid state even though it should be valid");

    log::info!("Loading dummy listener");
    let listener2 = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base-listener"),
        false
    ).expect("Failed to load listener");
    log::info!("Dummy listener loaded");

    assert!(!pm.get_metadata(&listener2).unwrap().enabled(), "Second listener is enabled while first listener is still enabled");
    assert!(pm.get_metadata(&listener).unwrap().enabled(), "First listener is disabled after loading second listener");

    log::info!("Enabling dummy listener");
    pm.enable_plugin(&listener2).expect("Failed to enable second listener");
    log::info!("Dummy listener enabled");

    assert!(pm.get_metadata(&listener2).unwrap().enabled(), "Second listener is disabled after user attempter to enable it");
    assert!(!pm.get_metadata(&listener).unwrap().enabled(), "First listener is enabled after enabling second listener");
    pm.is_valid_state(true).expect("PluginManager is reporting an invalid state even though it should be valid");

}
