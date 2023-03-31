use std::{path::PathBuf, env};

use modnsd::plugins::manager::PluginManager;


#[test]
fn plugins_init() {
    let mut pm = PluginManager::new();

    let listener = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"),
        false
    ).expect("Failed to load listener");

    let resolver = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_resolver"),
        false
    ).expect("Failed to load resolver");

    assert!(!pm.get_metadata(&listener).unwrap().enabled(), "Listener is enabled before being initialized");
    assert!(!pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is enabled before being initialized");

    pm.init().expect("PluginManager failed to initialize");

    assert!(pm.get_metadata(&listener).unwrap().enabled(), "Listener is disabled after Pluginmanager::init()");
    assert!(pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is disabled after Pluginmanager::init()");
    pm.validate(true).expect("PluginManager is reporting an invalid state even though it should be valid");

    pm.disable_plugin(&resolver).expect("Failed to disable resolver");

    assert!(!pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is enabled after user attempted to disable it");
    pm.validate(true).expect_err("PluginManager is reporting a valid state even though no resolvers are enabled");

    pm.enable_plugin(&resolver).expect("Failed to enable resolver");

    assert!(pm.get_metadata(&resolver).unwrap().enabled(), "Resolver is disabled after user attempted to enable it");
    pm.validate(true).expect("PluginManager is reporting an invalid state even though it should be valid");

    let listener2 = pm.load(
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("../plugins/base_listener"),
        false
    ).expect("Failed to load listener");

    assert!(!pm.get_metadata(&listener2).unwrap().enabled(), "Second listener is enabled while first listener is still enabled");
    assert!(pm.get_metadata(&listener).unwrap().enabled(), "First listener is disabled after loading second listener");

    pm.enable_plugin(&listener2).expect("Failed to enable second listener");

    assert!(pm.get_metadata(&listener2).unwrap().enabled(), "Second listener is disabled after user attempter to enable it");
    assert!(!pm.get_metadata(&listener).unwrap().enabled(), "First listener is enabled after enabling second listener");
    pm.validate(true).expect("PluginManager is reporting an invalid state even though it should be valid");

}
