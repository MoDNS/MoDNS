
mod api;
mod dns;

pub use api::ApiListener;
pub use dns::DnsListener;
use tokio::sync::RwLock;
use tokio::{sync::broadcast};
use tokio::signal::unix::{signal, SignalKind};

use crate::ErrorBox;
use crate::plugins::executors::PluginManager;

/// Start API and DNS servers on the provided listeners
pub async fn listen(apiaddrs: Vec<api::ApiListener>, dnsaddrs: Vec<dns::DnsListener>, pm: &'static RwLock<PluginManager<'_>>) {

    let (shutdown, _) = broadcast::channel(1);

    if let Err(e) = tokio::try_join!(
        api::listen_api(apiaddrs, shutdown.clone()),
        dns::listen_dns(dnsaddrs, shutdown.clone(), pm),
        wait_for_shutdown(shutdown)
    ) {
        log::error!("Server halted due to error: {e:?}");
    };

}

/// Listens for shutdown signals (either SIGINT or SIGTERM) and broadcasts
/// a shutdown command on the supplied broadcast channel
async fn wait_for_shutdown(tx: broadcast::Sender<()>) -> Result<(), ErrorBox> {

    let mut sigint = signal(SignalKind::interrupt())?;
    let mut sigterm = signal(SignalKind::terminate())?;

    tokio::select! {
        _ = sigint.recv() => {},
        _ = sigterm.recv() => {},
    }

    log::debug!("Shutdown signal received; Attempting graceful shut down");

    tx.send(())?;

    Ok(())
}