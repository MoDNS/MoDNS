# REST API Endpoints

## `/`

Always returns `301` redirect to `/manage`

## `/manage/...`

Frontend

## `/api`

Entry point for REST API

## POST `/api/auth`

Authenticates a user & generates a session token for authenticating all other API calls

### `/api/plugins`

Root directory for management of plugins

#### GET `/api/plugins`

Lists plugins and their attributes in json

Accepts optional query parameters to filter based on certain attributes (ex: `/api/plugins?enabled=true`)

Example json response:
```json
[{
    "id": 0x4342,                                       // unique id to use in api calls related to this plugin. Probably just MD5/SHA1?
    "name": "AdBlocker",                                // set in manifest
    "description": "Default plugin that blocks ads",    // set in manifest
    "home": "/var/modns/plugins/adblock/",              // position in fs
    "impl": {                                           // info about steps this plugin implements
        "interceptor": {                                   // info about intercept function
            "enabled": true,                               // is intercept function enabled?
            "position": 2,                                 // position of intercept function in checking order
            "reason": "Will intercept and drop all requests to known ad providers"   // Description to help user understand when and why to enable a particular impl
        }
    }
    "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
},
{
    "id": 0x7465,
    "name": "Lan Cache"
    "description": "Redirects common downloads to a local caching server",
    "home": "/var/modns/plugins/lancache/",
    "impl": {
        "interceptor":{
            "enabled": true,
            "position": 3
        }
    }
    "enabled": false
},
{
    "id": 0x5c53,
    "name": "DNSSEC"
    "description": "Validates DNS responses using public key cryptography",
    "home": "/var/modns/plugins/dnssec/",
    "impl": {
        "validator":{
            "enabled": true,
            "reason": "Enable to attempt to validate requests sent to DNSSEC compatible zones"
        },
        "interceptor": {
            "enabled": true,
            "position": 1
            "reason": "Enable to allow plugin to respond to DNSSEC requests from downstream"
        }
    }
    "enabled": true
},
{
    "id": 0xa90c,
    "name": "Secure DNS"
    "description": "Sends DNS request over TLS encrypted channel",
    "home": "/var/modns/plugins/dnsovertls/",
    "impl": {
        "resolver":{
            "enabled": true
        },
        "listener": {
            "enabled": true,
            "reason": "Enable to allow this server to receive Secure DNS requests"
        }
    }
    "enabled": true
}]
```

#### POST `/api/plugins/install?format=(zip|tar.gz|git)`

Installs a new plugin by decompressing an uploaded archive file or by cloning a git repository

If `format` is `zip` or `tar.gz`, request body should be a binary file containing the plugin as an archive.

If `format` is `git`, request body should be an HTML form with parameters to access git repo.

#### POST `/api/plugins/uninstall?id=([0-9]+)`

Uninstalls a plugin by removing it from the file system.

*Must restart server to reload plugins*

#### POST `/api/plugins/interceptorder`

Sets the order for querying interceptor plugins. Request body should be a json list of plugin `id`s in desired order

#### POST `/api/plugins/enable?id=([0-9]+)[&impl=<enum>]`

Enable a 

### POST `/api/plugins/configure?id=([0-9]+)&<key>=<value>...`

Sets plugin-specific configuration parameters handled by the plugin itself. Plugin must implement a handler function
to work with this endpoint

#### POST `/api/plugins/command?id=([0-9]+)&command=<string>`

Pass a command to a plugin. Plugin must implement a handler function

#### GET `/api/plugins/favicon?id=([0-9]+)`

Gets the logo icon specified in a plugin's `manifest.yaml` file.

### `/api/server`

Root directory for server commands & configuration

#### POST `/api/server/restart`

Forces the server to reload all plugins

#### POST `/api/server/shutdown`

Shuts down the server

### POST `/api/server/configure?id=([0-9]+)&<key>=<value>...`

Configures server settings

#### GET `/api/server/config?<key>[&<key>]...`

Get a server configuration parameter