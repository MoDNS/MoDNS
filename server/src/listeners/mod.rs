
mod api;
mod dns;

pub use api::ApiListener;
pub use dns::DnsListener;

pub async fn listen(apiaddrs: Vec<api::ApiListener>, dnsaddrs: Vec<dns::DnsListener>) {

    if let Err(e) = tokio::try_join!(
        api::listen_api(apiaddrs),
        dns::listen_dns(dnsaddrs)
    ) {
        log::error!("Server halted due to error: {e:?}");
    };

}