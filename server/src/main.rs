use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::Context;

use modnsd::config;
use modnsd::plugins::manager::PluginManager;

use modnsd::listeners;
use modnsd::api;

use tokio::sync::RwLock;

#[tokio::main]
async fn main() -> anyhow::Result<()> {

    let config = config::ServerConfig::parse()?;

    env_logger::Builder::from_env(
        env_logger::Env::new()
        .filter("MODNS_LOG")
        .write_style("MODNS_LOG_STYLE")
    )
    .parse_filters(&config.log())
    .init();

    log::trace!("Starting server with configuration: {:#?}", config);

    let socket_path = config.unix_socket().to_owned();

    let pm_arc = Arc::new(RwLock::new(PluginManager::new(config)));

    {
        log::info!("Initializing plugins...");
        let mut pm = pm_arc.write().await;
        let path = pm.config().plugin_path();

        pm.search(&path)
        .or_else(|e| {

            log::error!("Got an error during initial plugin search: {e}");
            log::debug!("Full error: {e:#?}");

            if pm.config().strict_init() {
                Err(e)
                .context("Server refused to start because plugin initialization ran into an error\
                and the `--ignore-init-errors` flag is set to `never`")
            } else {
                Ok(())
            }
        })?;

        pm.is_valid_state(!pm.config().always_init())
        .context("Server refused to start because it does not have enough plugins enabled to resolve DNS requests.
        To ignore this case and start anyway, run with `--ignore-init-errors always`")?;

        log::info!("Plugin initialization successful");
    }

    let api_addr = api::ApiConfig::Http(SocketAddr::from(([0, 0, 0, 0], 80)));

    api::run(api_addr, pm_arc).await?;

    // listeners::listen(pm_arc).await;

    std::fs::remove_file(&socket_path)
    .with_context(|| format!("Failed to remove unix socket at {}", socket_path.display()))?;

    Ok(())

}
