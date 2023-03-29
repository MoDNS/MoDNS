
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

    assert!(pm.get_metadata(&uuid).unwrap().enabled());
}
