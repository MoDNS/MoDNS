
# Writing Plugins for MoDNS

The plugin system is what makes MoDNS, MoDNS. The MoDNS server is really
just a framework for running plugins. Any and all DNS functionality is
provided by plugins.

A _plugin_ is composed of one to five __modules__. These modules each
control a certain step in the DNS resolution process.

These modules are:

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

#### Asynchronous Method (Not Yet Implemented)

### Interceptor

### Resolver

### 

## Using Shared State

## Providing Plugin Settings

## Compiling Plugins

## Providing a Web Interface

## Packaging Plugins

## Full example: A simple logger written in Go
