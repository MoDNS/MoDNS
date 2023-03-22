
//////////////////////////////////////////////////////// VARIABLES ////////////////////////////////////////////////////////

let serverAddress = 'modns';

//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////


/////////////////////////////// PLUGIN MANAGE ///////////////////////////////

export const getPluginDict = async (filter) => {
    const response = await fetch(`http://${serverAddress}.local/api/plugins${filter ? `?modules=${filter}` : ''}`);
    return response.json();
}

export const installPlugin = (file) => {
    const formData = new FormData();
    formData.append('fileName', file)

    if (false) {
        fetch(`http://${serverAddress}.local/api/plugins/install`, {
            headers: {
                'Content-Type': 'application/zip'
            },
            body: formData,
        })
    } else if (false) {
        fetch(`http://${serverAddress}.local/api/plugins/install`, {
            headers: {
                'Content-Type': 'application/gzip'
            },
            body: formData,
        })
    } else if (false) {
        fetch(`http://${serverAddress}.local/api/plugins/install`, {
            headers: {
                'Content-Type': 'text/plain'
            },
            body: formData,
        })
    }
}

export const uninstallPlugin = async (uuid) => {
    await fetch(`http://${serverAddress}.local/api/plugins/uninstall?uuid=${uuid}`);
}

export const setInterceptOrder = async (uuidList) => {
    await fetch(`http://${serverAddress}.local/api/plugins/interceptorder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: uuidList,
    });
}

export const enabledisablePlugin = async (uuid, enabled) => {
    await fetch(`http://${serverAddress}.local/api/plugins/enable?uuid=${uuid}&enabled=${enabled}`);
}

export const configurePlugin = async (uuid, key, value) => {
    await fetch(`http://${serverAddress}.local/api/plugins/configure?uuid=${uuid}&${key}=${value}`);
}

export const getPluginConfig = async (uuid, key) => {
    const response = await fetch(`http://${serverAddress}.local/api/plugins/configure?uuid=${uuid}&${key}`)
    return response;
}

export const passCommand = async (uuid, command) => {
    await fetch(`http://${serverAddress}.local/api/plugins/configure?uuid=${uuid}&command=${command}`)
}

export const getPluginLogo = async (uuid) => {
    const response = await fetch(`http://${serverAddress}.local/api/plugins/favicon?uuid=${uuid}`);
    return response;
}

/////////////////////////////// SERVER MANAGE ///////////////////////////////

export const restartServer = async () => {
    await fetch(`http://${serverAddress}.local/api/server/restart`);
}

export const shutdownServer = async () => {
    await fetch(`http://${serverAddress}.local/api/server/shutdown`);
}

export const setServerConfig = async (key, value) => {
    await fetch(`http://${serverAddress}.local/api/server/config?${key}=${value}`, {
        method: 'POST',
    });
}

export const getServerConfig = async (key) => {
    const response = fetch(`http://${serverAddress}.local/api/config?${key}`);
    return response;
}

////////////////////////////// AUTHENTICATION ///////////////////////////////
export const getAuthentication = (password) => {
    const response = fetch(`http://${serverAddress}.local/api/auth`);
}

export const setNewPassword = (oldPass, newPass) => {
    // api call for authentication of old pass
    return true;
}

