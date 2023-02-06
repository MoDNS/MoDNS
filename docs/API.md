# REST API Endpoints

## `/`

Always returns `301` redirect to `/manage`

## `/manage/...`

Frontend

## `/api`

Entry point for REST API

## POST `/api/auth`

Authenticates a user & generates a session token for authenticating all other API calls

Session token is a JWT which is added to the `modns-auth` cookie.

### `/api/plugins`

Root directory for management of plugins

#### GET `/api/plugins`

CLI: `modns plugin list`

Lists plugins and their attributes in json

Accepts optional query parameters to filter based on certain attributes (ex: `/api/plugins?enabled=true&modules=interceptor`)

Example json response:

```json
[{
    "uuid": "6c396d8e-9a93-11ed-a8fc-0242ac120002",     // unique id to use in api calls related to this plugin.
    "friendly_name": "Ad Blocker",                      // set in manifest
    "description": "Default plugin that blocks ads",    // set in manifest
    "home": "/opt/modns/plugins/adblock/",              // position in fs
    "modules": ["interceptor"],                         // list of modules this plugin implements
    "intercept_position": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
    "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
},
{
    "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
    "friendly_name": "DNS Cache",
    "description": "Default plugin that caches results of previous requests",
    "home": "/opt/modns/plugins/dnscache",
    "modules": ["interceptor", "inspector"],
    "intercept_position": 2,
    "enabled": true
}
{
    "uuid": "667bad3d-5450-453c-a8dc-b2099ba6c4ef",
    "friendly_name": "Lan Cache",
    "description": "Redirects common download URLs to a local caching server",
    "home": "/opt/modns/plugins/lancache/",
    "modules": ["interceptor"],
    "intercept_position": null,
    "enabled": false
},
{
    "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
    "friendly_name": "DNSSEC Validator",
    "description": "Validates DNS responses using public key cryptography",
    "home": "/opt/modns/plugins/dnssec/",
    "modules": ["validator"],
    "enabled": true
},
{
    "uuid": "18897fca-1657-461d-b7d8-90cb5c6fb550",
    "friendly_name": "Secure DNS resolver",
    "description": "Sends DNS request over TLS encrypted channel",
    "home": "/opt/modns/plugins/dot/",
    "modules": ["resolver"],
    "enabled": true
},
{
    "uuid": "a379b0ad-8e45-4713-8707-1ebc22389ec5",
    "friendly_name": "Default Listener",
    "description": "Default listener plugin",
    "home": "/opt/modns/plugins/default-listener",
    "modules": ["listener"],
    "enabled": true
},
{
    "uuid": "600a45c3-0543-4e85-92ba-7c8727142d49dot",
    "friendly_name": "Secure DNS listener",
    "description": "Sends DNS request over TLS encrypted channel",
    "home": "/opt/modns/plugins/dot/",
    "modules": ["listener"],
    "enabled": false
}]
```

#### POST `/api/plugins/install`

CLI: `modns plugin install <archive|url>`

Installs a new plugin by decompressing an archive file included in the request or downloaded from the URL in the request

API distinguishes between archives and links using the MIME type listed in the `content-type` http header. Accepted formats are:

- `application/zip` for ZIP archives
- `application/gzip` for gzipped tarballs (`.tar.gz` files)
- `text/plain` for a URL pointing to a file to download which uses one of the above encodings

#### POST `/api/plugins/uninstall?uuid=<plugin uuid>`

CLI: `modns plugin uninstall <name|id>`

Uninstalls a plugin by removing it from the file system.

Must restart server to reload plugins

#### POST `/api/plugins/interceptorder`

CLI: `modns plugin set-priority <something>`

Sets the order for querying interceptor plugins. Request body should be a json list of plugin `id`s in desired order

#### POST `/api/plugins/enable?uuid=<plugin uuid>&enabled=<bool>[&impl=<enum>]`

CLI: `modns plugin (enable|disable) <name|id> [--mod <module>]`

Enable a plugin or a module that plugin implements

### POST `/api/plugins/configure?id=<plugin uuid>&<key>=<value>...`

CLI: `modns plugin set-config <name|id> <key> <value>`

Set plugin-specific configuration parameters handled by the plugin itself. Plugin must implement a handler function
to work with this endpoint

### GET `/api/plugins/configure?id=<plugin uuid>&<key>...`

CLI: `modns plugin get-config <name|id> <key> [<key>]...`

#### POST `/api/plugins/command?uuid=<plugin uuid>&command=<string>`

CLI: `modns command <name|id> <command>`

Pass a command to a plugin. Plugin must implement a handler function

#### GET `/api/plugins/favicon?uuid=<plugin uuid>`

Get the logo icon specified in a plugin's `manifest.yaml` file

### `/api/server`

Root directory for server commands & configuration

#### POST `/api/server/restart`

CLI: `modns restart`

Force the server to reload all plugins

#### POST `/api/server/shutdown`

CLI: `modns shutdown`

Shut down the server

### POST `/api/server/configure?uuid=<plugin uuid>&<key>=<value>...`

CLI: `modns config set <key> <value>`

Set a server configuration parameter

#### GET `/api/server/config?<key>[&<key>]...`

CLI: `modns config get <key>`

Get a server configuration parameter

### GET `/api/resolve?host=<hostname>[&record=<record type>]`

CLI: `modns resolve <hostname> [--record=<record type>]`

Resolve an ip address using the API
