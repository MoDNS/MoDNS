
pub mod types;

use types::{ffi, conversion};

pub mod helpers;

use std::ffi::c_void;

pub use conversion::FfiConversionError;

#[derive(Clone, Copy)]
pub struct PluginState(*mut c_void);

unsafe impl Send for PluginState {}
unsafe impl Sync for PluginState {}

impl From<*mut c_void> for PluginState {
    fn from(value: *mut c_void) -> Self {
        Self(value)
    }
}

impl PluginState {
    pub fn new() -> Self {
        Self(std::ptr::null_mut())
    }

    pub fn ptr(&self) -> *const c_void {
        self.0.cast_const()
    }

    pub fn mut_ptr(&mut self) -> *mut c_void {
        self.0
    }
}

// Plugin implementation functions
extern "C" {

/// Implement this function to have a setup function run when your plugin is
/// first loaded or enabled. The returned void pointer can point to any persistent
/// state that your plugin needs to keep track of.
/// 
/// The state pointer will be passed to all subsequent calls to your plugin,
/// and will not be touched by the server.
/// 
/// Make sure to also implement impl_plugin_teardown() to free the memory
/// it points to when your plugin is disabled.
pub fn impl_plugin_setup() -> *mut c_void;

/// Implement this function to free your plugin's state pointer
pub fn impl_plugin_teardown(plugin_state: *mut c_void);

/// Implement this function (and impl_encode_resp) to have your plugin
/// register as having a Listener module.
/// 
/// Recieves the byte stream from the UDP socket and a mutable buffer in which to
/// place the decoded message.
///
/// Return 0 on success, or any other number to indicate an error.
///
/// Notes:
///
/// The server makes no guarantees about the content of `message`. When decoding
/// a request, be sure to specify a value for all fields of the response, and
/// ensure all vector fields are of the proper size.
///
/// When the server recieves a non-zero return code, it will generate a default
/// response and attempt to encode that response using `impl_listener_sync_encode_resp`.
pub fn impl_listener_sync_decode_req(
    req: &ffi::ByteVector, message: &mut ffi::DnsMessage, plugin_state: *const c_void
) -> u8;

/// Implement this function (and impl_decode_req) to have your plugin
/// register as having a Listener module.
/// 
/// Recieves the response generated by interceptor or resolver modules and a buffer
/// in which to write the encoded response to send back to the requester
///
/// Return 0 on success and any other number on an error.
pub fn impl_listener_sync_encode_resp(
    resp: &ffi::DnsMessage, buf: &mut ffi::ByteVector, plugin_state: *const c_void
) -> u8;

/// Implement this function (and impl_listener_async_respond) for your plugin to
/// have a Listener module.
///
/// This function is periodically called in order to listen for incoming requests.
/// When a request is ready, the function should write that request to `*req` and
/// return 0. If not, the plugin should return 1. All other return codes indicate
/// an unrecoverable error, which will cause the plugin to be disabled.
///
/// The `req_state` pointer is for your plugin to keep track of any state that will
/// be needed to respond to the request, similarly to `plugin_state`, this pointer
/// is not touched by the server, and it is passed to the `impl_listener_async_respond`
/// function when the request generated by `poll` is resolved.
pub fn impl_listener_async_poll(
    req: &mut ffi::DnsMessage, req_state: *mut *mut c_void, plugin_state: *const c_void
) -> u8;

/// Implement this function (and impl_listener_async_poll) for your plugin to have
/// a Listener module
///
/// Recieves the response generated by interceptor or resolver modules and the
/// `req_state` pointer generated by the call to `poll` when the request was
/// recieved. Responds to the request in the appropriate manner.
///
/// Return 0 on success and any other number on an error.
///
/// `req_state` should also be destroyed as part of this function
pub fn impl_listener_async_respond(
    resp: &ffi::DnsMessage, req_state: *mut c_void, plugin_state: *const c_void
) -> u8;

/// Implement this function to have your plugin register as having an Interceptor
/// module.
///
/// Recieves the request, as well as a mutable buffer in which to optionally place
/// a response.
///
/// Return 0 to ignore and move on the the next interceptor, 1 to respond to the
/// request with the message encoded in `resp`, or any other number to indicate an
/// unrecoverable error.
///
/// Notes:
///
/// The server makes no guarantees about the contents of `resp`. When responding to a
/// request, always specify a value for all fields of the response, and ensure all
/// vector fields are of the proper size.
///
/// It is generally advisable to only return an error code if an error has occurred
/// which would adversly affect the entire server or other plugins. Otherwise,
/// simply log the error using the appropriate logging helper function, and return 0
/// to ignore the request
pub fn impl_intercept_req(
    req: &ffi::DnsMessage, resp: &mut ffi::DnsMessage, plugin_state: *const c_void
) -> u8;

/// Implement this function for your plugin to register as having a Resolver module.
/// 
/// Recieves the request and a mutable buffer in which to encode the response.
///
/// Return 0 on success and any other number on an error.
///
/// Notes:
///
/// The server makes no guarantees about the contents of `resp`. When responding to a
/// request, always specify a value for all fields of the response, and ensure all
/// vector fields are of the proper size.
pub fn impl_resolver_sync_resolve_req(
    req: &ffi::DnsMessage, resp: &mut ffi::DnsMessage, plugin_state: *const c_void
) -> u8;

/// Implement this function for your plugin to register as having a Validator module.
///
/// Recieves the request and response, as well as a mutable buffer in which to place
/// the response when an invalid response is encountered.
///
/// Return 0 on a valid response and 1 on an invalid response (meaning that `error_resp`
/// should be sent instead of `resp`). Return any other number on an error.
///
/// Notes:
///
/// The server makes no guarantees about the contents of `resp`. When responding to a
/// request, always specify a value for all fields of the response, and ensure all
/// vector fields are of the proper size.
///
/// It is generally advisable to only return an error code if an error has occurred
/// which would adversly affect the entire server or other plugins. Otherwise,
/// simply log the error using the appropriate logging helper function, and return 0
/// to ignore the request
pub fn impl_validate_resp(
    req: &ffi::DnsMessage, resp: &ffi::DnsMessage, error_resp: &mut ffi::DnsMessage, plugin_state: *const c_void
) -> u8;

/// Implement this function for your plugin to register as having an Inspector module.
/// 
/// Recieves the request, response, and an unsigned number indicating the source of the
/// response.
///
/// `source` is 0 if the response came from an interceptor, 1 if it came from the resolver,
/// and 2 if it was an error response sent by a validator.
///
/// Return 0 on success or any other number on an error.
/// 
/// This function will have no effect on the response sent to the client. It should be
/// used for logging purposes or to keep track of responses in support of another
/// implemented module.
///
/// For example, an Inspector could be used to log responses from the resolver in order
/// to populate a cache, which is then used by an Interceptor to provide cached results
/// on future requests.
pub fn impl_inspect_resp(
    req: &ffi::DnsMessage, resp: &ffi::DnsMessage, source: u8, plugin_state: *const c_void
) -> u8;

}

