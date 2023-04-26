# REST API Endpoints

## Root

Route: `/`

Always returns `301` redirect to `/manage`

## Frontend

Route: `/manage/...`

## API

Route: `/api`

Entry point for REST API

Possible return codes for all endpoints are listed under the documentation for that endpoint.
Unless otherwise stated, each endpoint can also return `400 Bad Request` when the request is
improperly formatted, `401 Unauthorized` if the user is unauthenticated, or a `500 Internal Server Error`
in the case of an unexpected server error. In all cases, no additional information will be returned,
but the server will log the error when possible

### Authentication

Endpoint: `POST /api/auth`

Authenticates a user & generates a session token for authenticating all other API calls

Session token is a JWT which is added to the `modns-auth` cookie as a `Bearer` token.

Returns:
- `200 OK` on a successful login
- `401 Unauthorized` otherwise

### Plugin Management

Route: `/api/plugins`

Root directory for management of plugins

#### List Plugin Metadata

Endpoint: GET `/api/plugins`

CLI: `modns plugin list`

Lists plugins and their attributes in json

Accepts optional query parameters to filter based on certain attributes (ex: `/api/plugins?enabled=true&module=interceptor`)

Acceptable filter parameters:
- `enabled` (bool): Show plugins which are or are not enabled
- `module` (string): Show plugins which implement the given module
- `uuid` (string): List only the plugin with the matching UUID

Always returns `200 OK` assuming no error condition

Example json response:

```json
[{
    "6c396d8e-9a93-11ed-a8fc-0242ac120002": {               // UUID to be used in API calls to reference the plugin
        "friendly_name": "Ad Blocker",                      // set in manifest
        "description": "Default plugin that blocks ads",    // set in manifest
        "home": "/opt/modns/plugins/adblock/",              // position in fs
        "listener": false,                                  // if plugin implements various modules
        "interceptor": true,
        "resolver": false,
        "validator": false,
        "inspector": false,
        "intercept_position": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
        "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
    }
},
{
    "cd9735cb-5c12-491a-b032-6ccd8cfd6855": {
        "friendly_name": "DNS Cache",
        "description": "Default plugin that caches results of previous requests",
        "home": "/opt/modns/plugins/dnscache",
        "listener": false,
        "interceptor": true,
        "resolver": false,
        "validator": false,
        "inspector": false,
        "intercept_position": 2,
        "enabled": true
    }
}
{
    "667bad3d-5450-453c-a8dc-b2099ba6c4ef": {
        "friendly_name": "Lan Cache",
        "description": "Redirects common download URLs to a local caching server",
        "home": "/opt/modns/plugins/lancache/",
        "listener": false,
        "interceptor": true,
        "resolver": false,
        "validator": false,
        "inspector": false,
        "intercept_position": null,
        "enabled": false
    }
},
{
    "cd9735cb-5c12-491a-b032-6ccd8cfd6855": {
        "friendly_name": "DNSSEC Validator",
        "description": "Validates DNS responses using public key cryptography",
        "home": "/opt/modns/plugins/dnssec/",
        "listener": false,
        "interceptor": false,
        "resolver": false,
        "validator": true,
        "inspector": false,
        "intercept_position": null,
        "enabled": true
    }
},
{
    "18897fca-1657-461d-b7d8-90cb5c6fb550": {
        "friendly_name": "Secure DNS resolver",
        "description": "Sends DNS request over TLS encrypted channel",
        "home": "/opt/modns/plugins/dot/",
        "listener": false,
        "interceptor": false,
        "resolver": true,
        "validator": false,
        "inspector": false,
        "enabled": true
    }
},
{
    "a379b0ad-8e45-4713-8707-1ebc22389ec5": {
        "friendly_name": "Default Listener",
        "description": "Default listener plugin",
        "home": "/opt/modns/plugins/default-listener",
        "listener": true,
        "interceptor": false,
        "resolver": false,
        "validator": false,
        "inspector": false,
        "enabled": true
    }
},
{
    "600a45c3-0543-4e85-92ba-7c8727142d49dot": {
        "friendly_name": "Secure DNS listener",
        "description": "Listens for requests over TLS encrypted channel",
        "home": "/opt/modns/plugins/dot/",
        "listener": true,
        "interceptor": false,
        "resolver": false,
        "validator": false,
        "inspector": false,
        "enabled": false
    }
}]
```

#### Install a new plugin

Endpoint: `POST /api/plugins/install`

CLI: `modns plugin install <archive|url>`

Installs a new plugin by decompressing an archive file included in the request body or downloaded from the URL in the request

New plugin is added to a directory on the server and then loaded

Plugin will be disabled by default. to enable, add the `?enable` query parameter

API distinguishes between archives and links using the MIME type listed in the `content-type` http header. Accepted formats are:

- `application/zip` for ZIP archives
- `application/gzip` for gzipped tarballs (`.tar.gz` files)
- `text/plain` for a URL pointing to a file to download which uses one of the above encodings

Returns:
- `201 Created` when succesfuly installed, with the new plugin's `uuid` as the body

#### Uninstall a plugin

Endpoint `POST /api/plugins/<uuid>/uninstall`

CLI: `modns plugin uninstall <name|uuid>`

Uninstalls a plugin by removing it from the file system.

#### Set the interception queue order

Endpoint: `POST /api/plugins/interceptorder`

CLI: `modns plugin set-priority <something>`

Sets the order for querying interceptor plugins. Request body should be a json list of plugin `uuid`s in desired order

Example request body:

```json
[
    "6c396d8e-9a93-11ed-a8fc-0242ac120002",
    "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
]
```

Returns `200 OK` on success

#### Enable or disable a plugin

Endpoint: `POST /api/plugins/<uuid>/enable?enabled=<bool>`

CLI: `modns plugin (enable|disable) <name|uuid>`

Enable or disable the plugin with `uuid`.

If the plugin implements an interceptor, the plugin is added 

Returns `200 OK` on success

#### Configure a plugin

Endpoint: `POST /api/plugins/<uuid>/config?<key>=<value>...`

CLI: `modns plugin set-config <name|uuid> <key> <value>`

Set plugin-specific configuration parameters handled by the plugin itself. Plugin must implement a handler function
for this endpoint to do anything

Return code determined by plugin

#### Get a plugin's configuration

Endpoint: `GET /api/plugins/<uuid>/config?<key>...`

CLI: `modns plugin get-config <name|uuid> <key> [<key>]...`

Returns `200 OK` on success with the configuration value in the body

Error codes can be determined by plugin, or `404 Not Found` by default

#### Send a command to a plugin

Endpoint: `POST /api/plugins/command?uuid=<plugin uuid>&command=<string>`

CLI: `modns plugin command <name|uuid> <command>`

Pass a command to a plugin. Plugin must implement a handler function

Return code determined by plugin

#### Get a plugin's custom settings page

Endpoint : `GET /api/plugins/<uuid>/settingspage`

Get the setting's page specified in a plugin's `manifest.yaml` file

Returns:
    - `200 OK` with the JSON object as the body
    - `404 Not Found` if the plugin does not have a custom settings page

#### Get a plugin's icon

Endpoint: `GET /api/plugins/<uuid>/favicon`

Get the logo icon specified in a plugin's `manifest.yaml` file

Returns:
- `200 OK` with the icon file as the body
- `404 Not Found` if the plugin does not have an icon

#### Get Statistics from a plugin

Endpoint: `GET /api/plugins/<uuid>/stats/<key>`

Query a plugin for dashboard statistics with `key`

Passes directly to plugin's `impl_statistics` function. Return data and code
are controlled by plugin, but should conform to expectations for associated dashboard widget

### Server Configuration

Root: `/api/server`

Root directory for server commands & configuration

#### Restart the server

Endpoint: `POST /api/server/restart`

CLI: `modns restart`

Force the server to restart and reload all plugins

Returns `200 OK` before server attempts to shut down

#### Shut down the server

Endpoint `POST /api/server/shutdown`

CLI: `modns shutdown`

Returns `200 OK` before server attempts to shut down

#### Set a server configuration parameter

Endpoint: POST `/api/server/config?<key>=<value>`

CLI: `modns config set <key> <value>`

Returns:
- `200 OK` when value is successfuly set
- `404 Not Found` if provided `key` is not a configuration option

#### Get one or more server configuration parameters

Endpoint: `GET /api/server/config?<key>[&<key>]...`

CLI: `modns config get <key>`

Get a server configuration parameter

if `key` is `"all"`, server will return entire configuration

Returns:
- `200 OK` with JSON object representing requested key-value pairs
- `404 Not Found` if one or more requested keys do not exist


#### Get the Layout of the Dashboard

Endpoint: `GET /api/server/dashboard`

CLI: `modns dashboard get`

Returns:
 - `200 OK` with JSON object of the Dashboards Layout.
 - `404 Not Found` if no dashboard has been created


### Send a test DNS request and resolve the IP

Endpoint: `GET /api/resolve?host=<hostname>[&record=<record type>]`

CLI: `modns resolve <hostname> [--record=<record type>]`

Might also become reserved for DNS over HTTPS down the line

