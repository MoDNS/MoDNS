
use std::{sync::Arc, ffi::c_void};

use modns_sdk::types::ffi;
use tokio::sync::RwLock;

use super::{manager::PluginManager, ResponseSource};

impl PluginManager {

    pub async fn listen(pm_lock: Arc<RwLock<Self>>) {
        loop {
            let self_lock = pm_lock.clone();
            let pm = self_lock.read().await;

            match pm.poll_listeners() {
                Ok(None) => {},
                Ok(Some((req, responder, req_ptr))) => {
                    log::debug!("Recieved request from `{}`", responder.friendly_name());

                    let lock = pm_lock.clone();

                    let req_ptr = req_ptr as usize;

                    tokio::spawn(async move {
                        let pm = lock.read().await;
                        let resp = pm.generate_response(Box::new(req));

                        if let Err(e) = responder.respond(resp.as_ref(), req_ptr as *mut c_void) {
                            log::error!("`{}` returned error when responding to a request: {e}", responder.friendly_name())
                        };
                    });

                    continue
                },
                Err(e) => {
                    log::error!("Got an error while polling listeners: {e}")
                }
            }
        }
    }

    pub fn generate_response(&self, req: Box<ffi::DnsMessage>) -> Box<ffi::DnsMessage> {

        let interceptor_result = self.poll_interceptors(&req)
        .unwrap_or_else(|e| {
                log::error!("Encountered an unrecoverable error while polling interceptors: {e}");

                None
            });

        let (response, source) = match interceptor_result {
            Some(resp) => (resp, ResponseSource::Interceptor),
            None => {
                let resp = self.resolve(&req)
                    .unwrap_or_else(|e| {
                        log::error!("Resolver encountered an unrecoverable error: {e}");
                        Box::new(ffi::DnsMessage::with_error_code(2))
                    });

                (resp, ResponseSource::Resolver)
            },
        };

        let validator_result = self.poll_validators(&req, &response)
            .unwrap_or_else(|e| {
                log::error!("Encountered an unrecoverable error while polling validators: {e}");

                None
            });

        let (response, source) = match validator_result {
            Some(resp) => (resp, ResponseSource::Validator),
            None => (response, source)
        };

        self.notify_inspectors(&req, &response, source);

        response
    }
}
