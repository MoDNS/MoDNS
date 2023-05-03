

//////////////////////////////////////////////////////// SETTINGS ////////////////////////////////////////////////////////


/////////////////////////////// PLUGIN MANAGE ///////////////////////////////

export const getPluginDict = async (filter) => {
    return await fetch(`${window.location.origin}/api/plugins${filter ? `?module=${filter}` : ''}`, {
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

    try {
        let extension = file.name.split('.').at(-1).toLowerCase();

        if (extension !== "zip" && extension !== "gzip") {
            alert("Not a zip or gzip");
            return;
        }
    
        fetch(`${window.location.origin}/api/plugins/install`, {
            method: 'POST',
            headers: {
                'Content-Type': `application/${extension}`
            },
            body: file,
        })
        
    } catch (error) {
        alert("There was a problem with this file");
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
    await fetch(`${window.location.origin}/api/plugins/${uuid}/${enabled ? "enable" : "disable"}`, {
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
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    });
}

export const getDashboardData = async (uuid, key) => {
    return await fetch(`${window.location.origin}/api/plugins/${uuid}/stats/${key}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    })
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
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    })
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

export const setServerConfig = async (dict) => {
    if (Object.keys(dict || {}).length === 0) {
        return
    }
    console.log(JSON.stringify(dict));
    await fetch(`${window.location.origin}/api/server/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    });
}

export const getServerConfig = async (keys) => {
    console.log(`${window.location.origin}/api/server/config${keys ? `?keys=${keys}` : ""}`)
    return await fetch(`${window.location.origin}/api/server/config${keys ? `?keys=${keys}` : ""}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    })
}

export const getDashboardLayoutAPI = async () => {
    return await fetch(`${window.location.origin}/api/dashboard`,{
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    });
}

export const setDashboardLayoutAPI = async (dashboard) => {
    return await fetch(`${window.location.origin}/api/dashboard`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'data': dashboard }),
    });
}

