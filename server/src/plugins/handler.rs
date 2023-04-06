
use modns_sdk::types::ffi;

use super::{manager::PluginManager, ResponseSource};

impl PluginManager {

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
