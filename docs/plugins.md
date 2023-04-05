
# Writing Plugins for MoDNS

The plugin system is what makes MoDNS, MoDNS. The MoDNS server is really
just a framework for running plugins. Any and all DNS functionality is
provided by plugins.

A _plugin_ implements one to five __modules__. These modules each
control a certain step in the DNS resolution process.

Modules which a plugin can implement are:

- __Listeners__, which control how and when DNS requests are recieved
- __Interceptors__, which can _intercept_ a request and provide a
response before it is resolved.
- __Resolvers__, which control how normal requests are resolved
- __Validators__, which can validate a response provided by the resolver
- __Inspectors__, which can view all requests and subsequent responses

MoDNS plugins are shared library files which export certain functions
using the __C ABI__. This has the benefit of meaning that most modern
compiled programming languages can be used to write MoDNS plugins,
albeit with some coercsion.

The `modns-sdk` Rust crate is used to provide functions and headers for
interfacing with the MoDNS server.

## Implementing Modules

The MoDNS server automatically considers a plugin as implementing a certain
module if the plugin's library exports the required functions for that
module. This section describes those functions and their requirements.

### Listener

A listener has two duties: to notify the server when a request has been
recieved, and to respond to that request when the server has resolved it.

A note about async:

Since the MoDNS server runs asynchronously, and listeners by their nature cannot be run
synchronously without blocking, the preferred method for writing listeners is
asynchronous. This method is not yet implemented, so documentation is provided
here for the less powerful synchronous method and the more powerful asynchronous
method. Note that the synchronous method will likely be deprecated by the
asynchronous method once it is fully implemented.

#### Synchronous Method (Deprecated)

Synchronous listeners are linked to a socket which is handled by the server. They
recieve the complete bytestream from the socket and are responsible for deserializing
it into a DNS message.

Plugins implementing a synchronous listener must export the following C functions:

```C
// Decoder function
uint8_t impl_listener_sync_decode_req(struct ByteVector req,
                                      struct DnsMessage *message,
                                      const void *plugin_state);

// Encoder function
uint8_t impl_listener_sync_encode_resp(const struct DnsMessage *resp,
                                       struct ByteVector *buf,
                                       const void *plugin_state);
```

The decoder function takes the byte stream encoded in `req` and deserializes it into
the contents of `message`.

The encoder function takes the DNS message struct contained in `*resp` and encodes
it into the byte stream at `buf`.

See [below](#interacting-with-provided-types) for information about the provided
structs

Both functions also recieve a `plugin_state` argument, discussed
[below](#using-shared-state)

##### Return Value

Both functions return 0 on success and any other number on error. Error handling is not
yet fully fleshed out, but generally an error code should only be returned in the case
of an unrecoverable error that will likely propagate to further calls of the plugin.

##### Reasons For Deprecation

The synchronous method is planned for deprecation once the asynchronous method is
implemented. This is for several reasons, namely:

- Synchronous listeners are limited in ability, since the actual method for recieving
requests must be handled by the server. For example, a plugin couldn't implement a
DNS over HTTPS listener unless the server provided a significant amount of the infrastructure
to do so.
- Synchronous listeners must be paired with a single socket connection managed by the
server. Configuring this socket pairing adds complexity to the user experience which
goes against the goals of this project

#### Asynchronous Method (Not Yet Implemented)

NOTE: Asynchronous listeners are not yet supported, and the following documentation
is subject to change as implementation details get fleshed out

Asynchronous listeners are periodically polled for a DNS message. If they are not ready
to provide one (i.e., one has not been recieved), the server will move on to poll other
listeners.

Plugins implementing an asynchronous listener must export the following C functions:

```C
// Poll function
uint8_t impl_listener_async_poll(struct DnsMessage *message,
                                 void *request_state,
                                 const void *plugin_state);

// Responder function
uint8_t impl_listener_async_respond(const struct DnsMessage *resp,
                                    void *request_state,
                                    const void *plugin_state);
```

The poll function is called when the server polls the plugin for a request.
If a request is not yet avaliable, this function returns 1; Once a message is available,
the function should encode that message into `*message` and return 0.

The responder function is used to respond to the request with the response message generated
by the server.

A `request_state` pointer is also provided for the plugin to store ephemeral state specific
to that request, such as the originating address. Similar to `plugin_state`, the contents of
this pointer are unknown to the server, and should be used to provide any persistent state
data to the responder function for responding to the request (ex. the socket address that
the request originated from).

### Interceptor

Io implement an Interceptor, your plugin must export the following C function:

```C
uint8_t impl_intercept_req(const struct DnsMessage *req,
                           struct DnsMessage *resp,
                           const void *plugin_state)
```

To ignore the request, return 0. To respond to the request, encode a response into `*resp` and
return 1. Any other return code indicates an unrecoverable error.

### Resolver

To implement a Resolver, your plugin must export the following C function:

```C
uint8_t impl_resolve_req(const struct DnsMessage *req,
                         struct DnsMessage *resp,
                         const void *plugin_state)
```

This function is called to generate a response to the request whenever no interceptor responds.
On success, this function should encode the response into `*resp` and return 0. Return any other
number to indicate an unrecoverable error.

### Validator

To implement a Validator, your plugin must export the following C function:

```C
uint8_t impl_validate_resp(const struct DnsMessage *req,
                           const struct DnsMessage *resp,
                           struct DnsMessage *err_resp,
                           const void *plugin_state)
```

This function is called to validate a response from the Resolver and possibly replace the response
with one indicating an error. On a valid response, this function should return 0. On an invalid
response, this function should encode a new response into `*err_resp` and return 1. Return any other
number to indicate an unrecoverable error.

### Inspector

To implement an Inspector, your plugin must export the following C function:

```C
uint8_t impl_inspect_resp(const struct DnsMessage *req,
                          const struct DnsMessage *resp,
                          uint8_t source,
                          const void *plugin_state)
```

This function is called once a response has been returned from the other plugins. It does not affect
the response.

The `source` argument indicates the step of the resolution process which originated the provided
response. A `0` indicates a response from an Interceptor, `1` indicates a Resolver, and `2`
indicates the response was an error response from a Validator.

This function should return 0 on success and any other number to indicate an unrecoverable error.

## Interacting with provided types

The MoDNS server and SDK are written in Rust, and so all non-native data types used for programming
plugins are FFI-safe versions of types written in Rust. Types which involve lists of objects use
wrapper types for Rust `Vec<T>` types, and the SDK provides helper functions for resizing these
arrays using the Rust allocator.

To maintain memory safety, all data which originates from the MoDNS server (i.e., any data passed as
an argument to one of the implementation functions) should be allocated by Rust rather than by the
plugin's native allocator. This is discussed in more detail [below](#allocating-vectorized-data). 

### Handling DNS Messages

The `DnsMessage` struct encodes all fields of a DNS message as defined by
[RFC 1035](https://datatracker.ietf.org/doc/html/rfc1035). Its Rust definition looks like this:

```Rust
pub struct DnsMessage {
    pub id: u16,
    pub is_response: bool,
    pub opcode: DnsOpcode,
    pub authoritative_answer: bool,
    pub truncation: bool,
    pub recursion_desired: bool,
    pub recursion_available: bool,
    pub response_code: DnsResponseCode,
    pub questions: Vec<DnsQuestion>,
    pub answers: Vec<DnsResourceRecord>,
    pub authorities: Vec<DnsResourceRecord>,
    pub additional: Vec<DnsResourceRecord>
}
```

#### Opcodes and Rcodes

Currently, Opcodes and Rcodes are encoded as enums, with the following
Rust declaration:

```rust

#[derive(Debug)]
pub enum DnsOpcode {
    Query,
    InverseQuery,
    Status,
    Notify,
    Update,
    DSO
}

#[derive(Debug)]
pub enum DnsResponseCode {
    NoError,
    FormatError,
    ServerFailure,
    NameError,
    NotImplemented,
    Refused
}

```

This was written to match [RFC 1035](https://datatracker.ietf.org/doc/html/rfc1035),
however it does not account for later changes to the DNS specification,
specifically [EDNS](https://datatracker.ietf.org/doc/html/rfc6891). For this
reason, later versions of the SDK will replace these fields with `u16` numbers.

#### Questions and Resource Records

The "meat" of DNS messages are Questions and Resource Records. These types are defined
in Rust as follows:

```Rust

pub struct DnsQuestion {
    pub name: Vec<String>,
    pub type_code: u16,
    pub class_code: u16
}

pub struct DnsResourceRecord {
    pub name: Vec<String>,
    pub type_code: u16,
    pub class_code: u16,
    pub ttl: i32,
    pub rdlength: u16,
    pub rdata: DnsResourceData
}

pub enum DnsResourceData {
    A { address: Ipv4Addr },
    AAAA { address: Ipv6Addr },
    Ns { nsdname: Vec<String> },
    Cname { cname: Vec<String> },
    Ptr { ptrdname: Vec<String> },
    Soa {
        mname: Vec<String>,
        rname: Vec<String>,
        serial: u32,
        refresh: u32,
        retry: u32,
        expire: u32,
        minimum: u32
    },
    Txt { txt_data: Vec<String> },
    Other { rdata: Vec<u8> }
}

```

The `DnsResourceData` enum is also provided and includes types for some of the most
common RR types. RR types not accounted for should be encoded as the `Other` variant
with `rdata` as a byte vector which matches the standard over-the-wire encoding of
that type.

It is good practice, though not a guarantee, that plugins which create `DnsMessage`s
should encode types which have enum variants as the corresponding enum variant. Plugins
which consume `DnsMessage`s should expect either form of these types (i.e. the matching
enum variant or as `Other`).

### Working With Vectorized Data

Data which involves Vectorized data is encoded as an FFI-safe version of Rust's `Vec<T>`
type. The SDK provides the following types:

- `QuestionVector` = `Vec<DnsQuestion>`
- `RRVector` = `Vec<DnsResourceRecord>`
- `ByteVector` = `Vec<u8>` or `String`
- `BytePtrVector` = `Vec<Vec<u8>>` or `Vec<String>`

For each of these types, A `resize` function is provided that should be used to add
or remove elements from these vectors. For example, to resize `QuestionVector my_vec`
to include 4 `DnsQuesion`s:

```C
uint8_t rc = resize_question_vec(&my_vec, 4);
```

A non-zero return code indicates an error.

## Using Shared State

## Providing Plugin Settings

### Key-Value settings

### Plugin Commands

## Compiling Plugins

## Providing a Web Interface

TODO: Frontend pls fill in

### Dashboard Widgets

### Settings Page

## Packaging Plugins

Now that we have all of our plugin's artifacts, we need to package
them into a form that can be installed and loaded into a running
MoDNS server.

### Plugin Manifest

The first thing we need to do is provide the last few pieces of
metadata for our plugin. Namely, this is the plugin's __friendly
name__ and __description__. These two pieces of metadata are used
by the frontend to provide a user-friendly interface for our plugin.

These extra metadata are provided in the `manifest.yaml` file. A
basic `manifest.yaml` file might look like this:

```yaml

friendly_name: Simple Logger

description: |
    This is a simple logger plugin. It logs all requests and
    their responses.

    This plugin is an example.

```

Note the `|` character at the beginning of the `description` field that
allows for the description to be multiple lines.

### Directory Structure

TODO: Add information for frontend files

On the MoDNS server, plugins are placed in a directory inside the server's
plugin path. When loading plugins, the server searches that directory for
subdirectories containing the required files (`plugin.so` and `manifest.yaml`).

For example, on a MoDNS server which has `/opt/modns/plugins` on it's plugin
path, that directory will look something like:

```
/opt/modns/plugins
├── plugin-1
│   ├── plugin.so
│   └── manifest.yaml
└── plugin-2
    ├── plugin.so
    └── manifest.yaml
```

When packaging our plugins, we compress them into `zip` or `tar.gz` archives
which mimic this structure. This has the added benefit of allowing us to
place multiple plugins in one package. For example, this might look like:

```
my-plugin-package.tar.gz
├── my-plugin-1
│   ├── plugin.so
│   └── manifest.yaml
└── my-plugin-2
    ├── plugin.so
    └── manifest.yaml
```

Please note that the server does use the directory names of each plugin
to provide cli-friendly names and to determine which plugins have already
been loaded. For this reason a few restrictions are imposed on plugin
directory names:

- The directory name must not contain spaces or other non-alphanumeric
characters. Dashes (`-`) can be substituted for spaces.
- The directory name must be unique. Use common sense to provide a name
for the plugin that won't interfere with other plugins. Note that
default plugins included with MoDNS begin with the `base-` prefix and
are typically stored separately from user-installed plugins

The server will refuse to load plugins which do not meet these requirements.

## Full example: A simple logger written in Go

