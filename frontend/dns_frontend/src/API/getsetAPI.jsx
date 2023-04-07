

//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////


/////////////////////////////// PLUGIN MANAGE ///////////////////////////////

export const getPluginDict = async (filter) => {
    const response = await (await fetch(`${window.location.origin}/api/plugins${filter ? `?modules=${filter}` : ''}`)).json();
    console.log(response);
    return response;
}

export const installPlugin = async (file) => {
    const formData = new FormData();
    formData.append('fileName', file)

    if (false) {
        fetch(`${window.location.origin}/api/plugins/install`, {
            headers: {
                'Content-Type': 'application/zip'
            },
            body: formData,
        })
    } else if (false) {
        fetch(`${window.location.origin}/api/plugins/install`, {
            headers: {
                'Content-Type': 'application/gzip'
            },
            body: formData,
        })
    } else if (false) {
        fetch(`${window.location.origin}/api/plugins/install`, {
            headers: {
                'Content-Type': 'text/plain'
            },
            body: formData,
        })
    }
}

export const uninstallPlugin = async (uuid) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/uninstall`);
}

export const setInterceptOrderAPI = async (uuidList) => {
    await fetch(`${window.location.origin}/api/plugins/interceptorder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: uuidList,
    });
}

export const enabledisablePlugin = async (uuid, enabled) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/enable?enabled=${enabled}`, {
        method: 'POST',
    });
}

export const configurePlugin = async (uuid, key, value) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/config?${key}=${value}`, {
        method: 'POST',
    });
}

export const getPluginConfig = async (uuid, key) => {
    const response = await fetch(`${window.location.origin}/api/plugins/${uuid}/config?${key}`)
    return response;
}

export const executePluginCommand = async (uuid, command) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/command/${command}`, {
        method: 'POST',
    })
}

export const getPluginCustomSettings = async (uuid) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/settingspage`);
}

export const getPluginLogo = async (uuid) => {
    const response = await fetch(`${window.location.origin}/api/plugins/${uuid}/favicon`);
    return response;
}

/////////////////////////////// SERVER MANAGE ///////////////////////////////

export const restartServer = async () => {
    await fetch(`${window.location.origin}/api/server/restart`, {
        method: 'POST',
    });
}

export const shutdownServer = async () => {
    await fetch(`${window.location.origin}/api/server/shutdown`, {
        method: 'POST',
    });
}

export const setServerConfig = async (key, value) => {
    await fetch(`${window.location.origin}/api/server/config?${key}=${value}`, {
        method: 'POST',
    });
}

export const getServerConfig = async (key) => {
    const response = fetch(`${window.location.origin}/api/config?${key}`);
    return response;
}

////////////////////////////// AUTHENTICATION ///////////////////////////////
export const getAuthentication = (password) => {
    return true
    // fetch(`${window.location.origin}/api/auth`);

}

export const setNewPassword = (oldPass, newPass) => {
    // api call for authentication of old pass
    return true;
}

