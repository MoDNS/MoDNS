


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
export const getModList = () => {
    return [
        {
            "uuid": "6c396d8e-9a93-11ed-a8fc-0242ac120002",     // unique id to use in api calls related to this plugin.
            "friendlyName": "Ad Blocker",                      // set in manifest
            "description": "Default plugin that blocks ads",    // set in manifest
            "home": "/opt/modns/plugins/adblock/",              // position in fs
            "implementations": ["interceptor"],                         // list of modules this plugin implements
            "interceptPosition": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
            "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
        },
        {
            "uuid": "cd9735cb-5c12-491a-b032-6ccd8cfd6855",
            "friendlyName": "DNS Cache",
            "description": "Default plugin that caches results of previous requests",
            "home": "/opt/modns/plugins/dnscache",
            "implementations": ["interceptor", "inspector"],
            "interceptPosition": 2,
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

