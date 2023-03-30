
use modnsd::plugins::manager::PluginManager;

fn init_logger() {
    let _ = env_logger::builder()
        .is_test(true)
        .filter_level(log::LevelFilter::Trace)
        .try_init();
}

#[test]
fn load_test_plugin() {

    init_logger();

    let mut pm = PluginManager::new();

    let uuid = pm.load("./tests/test-plugin", true).expect("Test plugin failed to load");
    pm.init().unwrap();

    assert!(pm.get_metadata(&uuid).unwrap().enabled());

    assert_eq!(pm.num_interceptors(), 1, "The PluginManager didn't report having an interceptor");

    assert_eq!(pm.num_validators(), 1, "The PluginManager didn't report having a validator");

    assert_eq!(pm.num_inspectors(), 1, "The PluginManager didn't report having an inspector");
}
