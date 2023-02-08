


//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////

/////////////////////////////// SERVER MANAGE ///////////////////////////////
export const setServerConfig = (key, value) => {
    console.log(key, value);
}

export const getServerConfig = (key) => {
    if (key === 'static_ip') {
        return "192.168.0.101";
    }
    if (key === 'use_static_ip') {
        return true;
    }
}

export const restartServer = () => {
    
}

export const shutdownServer = () => {

}

export const getAuthentication = (password) => {
    return true;
}

export const setNewPassword = (oldPass, newPass) => {
    // api call for authentication of old pass
    return true;
}

/////////////////////////////// MODS MANAGE ////////////////////////////////
export const getPluginList = (filter) => {
    if (!filter) {
        return [
            {
                "uuid": "6c396d8e-9a93-11ed-a8fc-0242ac120002",     // unique id to use in api calls related to this plugin.
                "friendly_name": "Ad Blocker",                      // set in manifest
                "description": "Default plugin that blocks ads",    // set in manifest
                "home": "/opt/modns/plugins/adblock/",              // position in fs
                "modules": ["interceptor"],                         // list of modules this plugin implements
                "intercept_position": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
                "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
            },
            {
                "uuid": "a379b0ad-8e45-4713-8707-1ebc22389ec5",
                "friendly_name": "Default Listener",
                "description": "Default listener plugin",
                "home": "/opt/modns/plugins/default-listener",
                "modules": ["listener"],
                "enabled": false
            },
            {
                "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "modules": ["interceptor", "inspector"],
                "intercept_position": 2,
                "enabled": true
            },
            {
                "uuid": "c77818df-750f-417c-9194-d6867ea87ecf",
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "modules": ["listener", "interceptor", "resolver"],
                "intercept_position": 3,
                "enabled": true
            },
            {
                "uuid": "20b06ef0-cf6b-447b-85b2-12033e974543",
                "friendly_name": "DNSSEC Validator",
                "description": "Validates DNS responses using public key cryptography",
                "home": "/opt/modns/plugins/dnssec/",
                "modules": ["validator"],
                "enabled": true
            },
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
                "uuid": "600a45c3-0543-4e85-92ba-7c8727142d49dot",
                "friendly_name": "Secure DNS listener",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "modules": ["listener"],
                "enabled": false
            },
            {
                "uuid": "18897fca-1657-461d-b7d8-90cb5c6fb550",
                "friendly_name": "Secure DNS resolver",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "modules": ["resolver"],
                "enabled": true
            },
        ]
    }
    if (filter === 'listener') {
        return [
            {
                "uuid": "a379b0ad-8e45-4713-8707-1ebc22389ec5",
                "friendly_name": "Default Listener",
                "description": "Default listener plugin",
                "home": "/opt/modns/plugins/default-listener",
                "modules": ["listener"],
                "enabled": false
            },
            {
                "uuid": "600a45c3-0543-4e85-92ba-7c8727142d49dot",
                "friendly_name": "Secure DNS listener",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "modules": ["listener"],
                "enabled": false
            },
            {
                "uuid": "c77818df-750f-417c-9194-d6867ea87ecf",
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "modules": ["listener", "interceptor", "resolver"],
                "intercept_position": 3,
                "enabled": true
            },
        ]
    }
    if (filter === 'interceptor') {
        return [
            {
                "uuid": "6c396d8e-9a93-11ed-a8fc-0242ac120002",
                "friendly_name": "Ad Blocker",
                "description": "Default plugin that blocks ads",
                "home": "/opt/modns/plugins/adblock/",
                "modules": ["interceptor"],
                "intercept_position": 1,
                "enabled": true
            },
            {
                "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "modules": ["interceptor", "inspector"],
                "intercept_position": 2,
                "enabled": true
            },
            {
                "uuid": "c77818df-750f-417c-9194-d6867ea87ecf",
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "modules": ["listener", "interceptor", "resolver"],
                "intercept_position": 3,
                "enabled": true
            },
        ]
    }
    if (filter === 'resolver') {
        return [
            {
                "uuid": "18897fca-1657-461d-b7d8-90cb5c6fb550",
                "friendly_name": "Secure DNS resolver",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "modules": ["resolver"],
                "enabled": true
            },
            {
                "uuid": "c77818df-750f-417c-9194-d6867ea87ecf",
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "modules": ["listener", "interceptor", "resolver"],
                "intercept_position": 3,
                "enabled": true
            },
        ]
    }
    if (filter === 'validator') {
        return [
            {
                "uuid": "20b06ef0-cf6b-447b-85b2-12033e974543",
                "friendly_name": "DNSSEC Validator",
                "description": "Validates DNS responses using public key cryptography",
                "home": "/opt/modns/plugins/dnssec/",
                "modules": ["validator"],
                "enabled": true
            },
        ]
    }
    if (filter === 'inspector') {
        return [
            {
                "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "modules": ["interceptor", "inspector"],
                "intercept_position": 2,
                "enabled": true
            },
        ]
    }
    
}

export const installPlugin = (file) => {
    console.log("installing...");
}

export const uninstallPlugin = (uuid) => {
    console.log("uninstalling...");
}

export const getPluginLogo = (uuid) => {
    return null;
}

export const setPluginOrder = (uuidList) => {
    console.log(uuidList);
}

export const enabledisableMod = (uuid, enabled) => {
    console.log(uuid + ": " + enabled);
}

export const configurePlugin = (uuid, key, value) => {

}

export const getPluginConfig = (uuid, key, value) => {
    return null;
}

