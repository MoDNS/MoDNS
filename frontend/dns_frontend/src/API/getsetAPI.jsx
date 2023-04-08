

//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////


/////////////////////////////// PLUGIN MANAGE ///////////////////////////////

export const getPluginDict = async (filter) => {
    return await fetch(`${window.location.origin}/api/plugins${filter ? `?modules=${filter}` : ''}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    }).then(response => {
        if(response.ok) {
            return response.json();
        } else {
            return {};
        }
        
    });
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
    return await fetch(`${window.location.origin}/api/plugins/${uuid}/config?${key}`, {
        method: 'GET',
    }).then(response => {
        if (response.ok) {
            return response;
        } else {
            return null;
        }
    });
}

export const executePluginCommand = async (uuid, command) => {
    await fetch(`${window.location.origin}/api/plugins/${uuid}/command/${command}`, {
        method: 'POST',
    })
}

export const getPluginCustomSettings = async (uuid) => {
    return await fetch(`${window.location.origin}/api/plugins/${uuid}/settingspage`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return [];
        }
    });
}

export const getPluginLogo = async (uuid) => {
    return await fetch(`${window.location.origin}/api/plugins/${uuid}/favicon`).then(response => {
        if (response.ok) {
            return response;
        } else {
            return null;
        }
    });

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
    return await fetch(`${window.location.origin}/api/config?${key}`).then(response => {
        if (response.ok) {
            return response;
        } else {
            return null;
        }
    })
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

