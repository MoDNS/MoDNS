


//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////

/////////////////////////////// SERVER MANAGE ///////////////////////////////
export const setServerConfig = (key, value) => {
    
}

export const getServerConfig = (key) => {
    return null;
}

export const restartServer = () => {

}

export const shutdownServer = () => {

}

/////////////////////////////// MODS MANAGE ////////////////////////////////
export const getPluginList = () => {
    return [
        {
            "uuid": "6c396d8e-9a93-11ed-a8fc-0242ac120002",     // unique id to use in api calls related to this plugin.
            "friendlyName": "Ad Blocker",                      // set in manifest
            "description": "Default plugin that blocks ads",    // set in manifest
            "home": "/opt/modns/plugins/adblock/",              // position in fs
            "modules": ["interceptor"],                         // list of modules this plugin implements
            "interceptPosition": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
            "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
        },
        {
            "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
            "friendlyName": "DNS Cache",
            "description": "Default plugin that caches results of previous requests",
            "home": "/opt/modns/plugins/dnscache",
            "modules": ["interceptor", "inspector"],
            "interceptPosition": 2,
            "enabled": true
        },
        {
            "uuid": "667bad3d-5450-453c-a8dc-b2099ba6c4ef",
            "friendlyName": "Lan Cache",
            "description": "Redirects common download URLs to a local caching server",
            "home": "/opt/modns/plugins/lancache/",
            "modules": ["interceptor"],
            "interceptPosition": null,
            "enabled": false
        },
        {
            "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
            "friendlyName": "DNSSEC Validator",
            "description": "Validates DNS responses using public key cryptography",
            "home": "/opt/modns/plugins/dnssec/",
            "modules": ["validator"],
            "enabled": true
        },
        {
            "uuid": "18897fca-1657-461d-b7d8-90cb5c6fb550",
            "friendlyName": "Secure DNS resolver",
            "description": "Sends DNS request over TLS encrypted channel",
            "home": "/opt/modns/plugins/dot/",
            "modules": ["resolver"],
            "enabled": true
        },
        {
            "uuid": "a379b0ad-8e45-4713-8707-1ebc22389ec5",
            "friendlyName": "Default Listener",
            "description": "Default listener plugin",
            "home": "/opt/modns/plugins/default-listener",
            "modules": ["listener"],
            "enabled": true
        },
        {
            "uuid": "600a45c3-0543-4e85-92ba-7c8727142d49dot",
            "friendlyName": "Secure DNS listener",
            "description": "Sends DNS request over TLS encrypted channel",
            "home": "/opt/modns/plugins/dot/",
            "modules": ["listener"],
            "enabled": false
        }
    ]
}

export const installMod = (file) => {
    console.log("installing...");
}

export const uninstallMod = (uuid) => {
    console.log("uninstalling...");
}

export const getModLogo= (uuid) => {
    return null;
}

export const setModOrder = (implementation, uuidList) => {
    
}

export const enabledisableMod = (uuid, enabled) => {
    console.log(uuid + ": " + enabled);
}

export const configureMod = (uuid, key, value) => {

}

export const getModConfig = (uuid, key, value) => {
    return null;
}

