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
    if (key === 'use_global_dashboard') {
        return false;
    }
    if (key === 'dashboard') {
        return [];
    }
}

export const restartServer = () => {
    
}

export const shutdownServer = () => {

}

export const getAuthentication = (password) => {
    if (password) {
        return true;
    }
    return false;
}

export const setNewPassword = (oldPass, newPass) => {
    // api call for authentication of old pass
    return true;
}

/////////////////////////////// MODS MANAGE ////////////////////////////////
export const getPluginDict = (filter) => {
    if (!filter) {
        return {
            "6c396d8e-9a93-11ed-a8fc-0242ac120002": {     // unique id to use in api calls related to this plugin.
                "friendly_name": "Ad Blocker",                      // set in manifest
                "description": "Default plugin that blocks ads",    // set in manifest
                "home": "/opt/modns/plugins/adblock/",              // position in fs
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
                "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
            },
            "a379b0ad-8e45-4713-8707-1ebc22389ec5": {
                "friendly_name": "Default Listener",
                "description": "Default listener plugin",
                "home": "/opt/modns/plugins/default-listener",
                "is_listener": true,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
            "cd9735cb-5c12-491a-b032-6ccd8cfd6855": {
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": true,
                "intercept_position": 2,
                "enabled": true
            },
            "c77818df-750f-417c-9194-d6867ea87ecf": {
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "is_listener": true,
                "is_interceptor": true,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 3,
                "enabled": true
            },
            "20b06ef0-cf6b-447b-85b2-12033e974543": {
                "friendly_name": "DNSSEC Validator",
                "description": "Validates DNS responses using public key cryptography",
                "home": "/opt/modns/plugins/dnssec/",
                "is_listener": false,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": true,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": true
            },
            "667bad3d-5450-453c-a8dc-b2099ba6c4ef": {
                "friendly_name": "Lan Cache",
                "description": "Redirects common download URLs to a local caching server",
                "home": "/opt/modns/plugins/lancache/",
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
            "600a45c3-0543-4e85-92ba-7c8727142d49dot": {
                "friendly_name": "Secure DNS listener",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "is_listener": true,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
            "18897fca-1657-461d-b7d8-90cb5c6fb550": {
                "friendly_name": "Secure DNS resolver",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "is_listener": false,
                "is_interceptor": false,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
        }

    } else if (filter === 'listener') {
        return {
            "a379b0ad-8e45-4713-8707-1ebc22389ec5": {
                "friendly_name": "Default Listener",
                "description": "Default listener plugin",
                "home": "/opt/modns/plugins/default-listener",
                "is_listener": true,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
            "c77818df-750f-417c-9194-d6867ea87ecf": {
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "is_listener": true,
                "is_interceptor": true,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 3,
                "enabled": true
            },
            "600a45c3-0543-4e85-92ba-7c8727142d49dot": {
                "friendly_name": "Secure DNS listener",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "is_listener": true,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
        }
    } else if (filter === 'interceptor') {
        return {
            "6c396d8e-9a93-11ed-a8fc-0242ac120002": {     // unique id to use in api calls related to this plugin.
                "friendly_name": "Ad Blocker",                      // set in manifest
                "description": "Default plugin that blocks ads",    // set in manifest
                "home": "/opt/modns/plugins/adblock/",              // position in fs
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 1,                            // if this plugin implements an interceptor, the position of that interceptor in the execution order
                "enabled": true                                     // allow plugins to be globally disabled even though they remain installed
            },
            "cd9735cb-5c12-491a-b032-6ccd8cfd6855": {
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": true,
                "intercept_position": 2,
                "enabled": true
            },
            "c77818df-750f-417c-9194-d6867ea87ecf": {
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "is_listener": true,
                "is_interceptor": true,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 3,
                "enabled": true
            },
            "667bad3d-5450-453c-a8dc-b2099ba6c4ef": {
                "friendly_name": "Lan Cache",
                "description": "Redirects common download URLs to a local caching server",
                "home": "/opt/modns/plugins/lancache/",
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
        }
    } else if (filter === 'resolver') {
        return {
            "c77818df-750f-417c-9194-d6867ea87ecf": {
                "friendly_name": "DNS over HTTP",
                "description": "Default plugin that uses http",
                "home": "/opt/modns/plugins/dohttp",
                "is_listener": true,
                "is_interceptor": true,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": 3,
                "enabled": true
            },
            "18897fca-1657-461d-b7d8-90cb5c6fb550": {
                "friendly_name": "Secure DNS resolver",
                "description": "Sends DNS request over TLS encrypted channel",
                "home": "/opt/modns/plugins/dot/",
                "is_listener": false,
                "is_interceptor": false,
                "is_resolver": true,
                "is_validator": false,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": false
            },
        }
    } else if (filter === 'validator') {
        return {
            "20b06ef0-cf6b-447b-85b2-12033e974543": {
                "friendly_name": "DNSSEC Validator",
                "description": "Validates DNS responses using public key cryptography",
                "home": "/opt/modns/plugins/dnssec/",
                "is_listener": false,
                "is_interceptor": false,
                "is_resolver": false,
                "is_validator": true,
                "is_inspector": false,
                "intercept_position": null,
                "enabled": true
            },
        }
    } else if (filter === 'inspector') {
        return {
            "cd9735cb-5c12-491a-b032-6ccd8cfd6855": {
                "friendly_name": "DNS Cache",
                "description": "Default plugin that caches results of previous requests",
                "home": "/opt/modns/plugins/dnscache",
                "is_listener": false,
                "is_interceptor": true,
                "is_resolver": false,
                "is_validator": false,
                "is_inspector": true,
                "intercept_position": 2,
                "enabled": true
            },
        }
    }
    
}

export const installPlugin = (file) => {
    console.log("installing...");
}

export const uninstallPlugin = (uuid) => {
    console.log("uninstalling...", uuid);
}

export const getPluginLogo = (uuid) => {
    return null;
}

export const getPluginCustomSettings = (uuid) => {
    return [];
    // return customSettings;
}

export const setPluginOrder = (uuidList) => {
    console.log(uuidList);
}

export const enabledisablePlugin = (uuid, enabled) => {
    console.log(uuid + ": " + enabled);
}

export const configurePlugin = (uuid, key, value) => {
    console.log(key + ": " + value);
}

export const executePluginCommand = (uuid, command) => {
    console.log(command);
}

export const getPluginConfig = (uuid, key) => {
    return null;
}

export const getDashboardData = (uuid, key) => {
    if (key === "bar") {
        return {
            index_by: "country",
            x_axis_label: 'Country',
            y_axis_label: 'Food',
            data: [
              {
                country: "AD",
                "hot dog": 137,
                burger: 96,
                kebab: 72,
                donut: 140,
              },
              {
                country: "AE",
                "hot dog": 55,
                burger: 28,
                kebab: 58,
                donut: 29,
              },
              {
                country: "AF",
                "hot dog": 109,
                burger: 23,
                burgerColor: "hl(96, 70%, 50%)",
                kebab: 34,
                donut: 152,
              },
              {
                country: "AG",
                "hot dog": 133,
                burger: 52,
                kebab: 43,
                donut: 83,
              },
              {
                country: "AI",
                "hot dog": 81,
                burger: 80,
                kebab: 112,
                donut: 35,
              },
              {
                country: "AL",
                "hot dog": 66,
                burger: 111,
                kebab: 167,
                donut: 18,
              },
              {
                country: "AM",
                "hot dog": 80,
                burger: 47,
                kebab: 158,
                donut: 49,
              },
            ]
          };
    } else if (key === "pie") {
        return [
            {
              "id": "elixir",
              "label": "elixir",
              "value": 218,
            },
            {
              "id": "javascript",
              "label": "javascript",
              "value": 533,
            },
            {
              "id": "rust",
              "label": "rust",
              "value": 579,
            },
            {
              "id": "php",
              "label": "php",
              "value": 120,
            },
            {
              "id": "go",
              "label": "go",
              "value": 69,
            }
          ];;
    } else if (key === "stat") {
        return {
            progress: 20,
            statistic: 123099,
            differenceFromLast: -150
          };
    } else if (key === "status") {
        return {
            status_text: 'Running',
            status_good: true,
          };
    } else if (key === "table") {
        return {
            headers: [
              {
                field: 'name',
                headerName: 'Name',
                width: 300,
              },
              {
                field: 'email',
                headerName: 'Email',
                width: 400,
              },
              {
                field: 'age',
                headerName: 'Age',
                type: 'number',
                width: 100,
              },
              {
                field: 'phone',
                headerName: 'Phone',
                type: 'number',
                width: 200,
              },
            ],
            data: [
              {
                name: "Jon Snow",
                email: "jonsnow@gmail.com",
                age: 35,
                phone: "(665) 121-5454",
              },
              {
                name: "Cersei Lannister",
                email: "cerseilannister@gmail.com",
                age: 42,
                phone: "(421) 314-2288",
              },
              {
                name: "Jaime Lannister",
                email: "jaimelannister@gmail.com",
                age: 45,
                phone: "(422) 982-6739",
              },
              {
                name: "Anya Stark",
                email: "anyastark@gmail.com",
                age: 16,
                phone: "(921) 425-6742",
              },
              {
                name: "Daenerys Targaryen",
                email: "daenerystargaryen@gmail.com",
                age: 31,
                phone: "(421) 445-1189",
              },
              {
                name: "Ever Melisandre",
                email: "evermelisandre@gmail.com",
                age: 150,
                phone: "(232) 545-6483",
              },
              {
                name: "Ferrara Clifford",
                email: "ferraraclifford@gmail.com",
                age: 44,
                phone: "(543) 124-0123",
              },
              {
                name: "Rossini Frances",
                email: "rossinifrances@gmail.com",
                age: 36,
                phone: "(222) 444-5555",
              },
              {
                name: "Harvey Roxie",
                email: "harveyroxie@gmail.com",
                age: 65,
                phone: "(444) 555-6239",
              },
            ]
          };
    } else if (key === "line") {
        return {
            x_axis_label: 'Transportation',
            y_axis_label: 'Count',
            data: [
              {
                "id": "japan",
                "data": [
                  {
                    "x": "plane",
                    "y": 94
                  },
                  {
                    "x": "helicopter",
                    "y": 171
                  },
                  {
                    "x": "boat",
                    "y": 25
                  },
                  {
                    "x": "train",
                    "y": 52
                  },
                  {
                    "x": "subway",
                    "y": 258
                  },
                  {
                    "x": "bus",
                    "y": 103
                  },
                  {
                    "x": "car",
                    "y": 274
                  },
                  {
                    "x": "moto",
                    "y": 237
                  },
                  {
                    "x": "bicycle",
                    "y": 294
                  },
                  {
                    "x": "horse",
                    "y": 150
                  },
                  {
                    "x": "skateboard",
                    "y": 232
                  },
                  {
                    "x": "others",
                    "y": 19
                  }
                ]
              },
              {
                "id": "france",
                "data": [
                  {
                    "x": "plane",
                    "y": 177
                  },
                  {
                    "x": "helicopter",
                    "y": 204
                  },
                  {
                    "x": "boat",
                    "y": 34
                  },
                  {
                    "x": "train",
                    "y": 143
                  },
                  {
                    "x": "subway",
                    "y": 295
                  },
                  {
                    "x": "bus",
                    "y": 286
                  },
                  {
                    "x": "car",
                    "y": 80
                  },
                  {
                    "x": "moto",
                    "y": 74
                  },
                  {
                    "x": "bicycle",
                    "y": 227
                  },
                  {
                    "x": "horse",
                    "y": 148
                  },
                  {
                    "x": "skateboard",
                    "y": 67
                  },
                  {
                    "x": "others",
                    "y": 102
                  }
                ]
              },
              {
                "id": "us",
                "data": [
                  {
                    "x": "plane",
                    "y": 254
                  },
                  {
                    "x": "helicopter",
                    "y": 264
                  },
                  {
                    "x": "boat",
                    "y": 282
                  },
                  {
                    "x": "train",
                    "y": 149
                  },
                  {
                    "x": "subway",
                    "y": 212
                  },
                  {
                    "x": "bus",
                    "y": 78
                  },
                  {
                    "x": "car",
                    "y": 105
                  },
                  {
                    "x": "moto",
                    "y": 112
                  },
                  {
                    "x": "bicycle",
                    "y": 243
                  },
                  {
                    "x": "horse",
                    "y": 54
                  },
                  {
                    "x": "skateboard",
                    "y": 273
                  },
                  {
                    "x": "others",
                    "y": 252
                  }
                ]
              },
              {
                "id": "germany",
                "data": [
                  {
                    "x": "plane",
                    "y": 77
                  },
                  {
                    "x": "helicopter",
                    "y": 251
                  },
                  {
                    "x": "boat",
                    "y": 205
                  },
                  {
                    "x": "train",
                    "y": 35
                  },
                  {
                    "x": "subway",
                    "y": 1
                  },
                  {
                    "x": "bus",
                    "y": 271
                  },
                  {
                    "x": "car",
                    "y": 298
                  },
                  {
                    "x": "moto",
                    "y": 295
                  },
                  {
                    "x": "bicycle",
                    "y": 161
                  },
                  {
                    "x": "horse",
                    "y": 60
                  },
                  {
                    "x": "skateboard",
                    "y": 229
                  },
                  {
                    "x": "others",
                    "y": 180
                  }
                ]
              },
              {
                "id": "norway",
                "data": [
                  {
                    "x": "plane",
                    "y": 286
                  },
                  {
                    "x": "helicopter",
                    "y": 227
                  },
                  {
                    "x": "boat",
                    "y": 56
                  },
                  {
                    "x": "train",
                    "y": 14
                  },
                  {
                    "x": "subway",
                    "y": 157
                  },
                  {
                    "x": "bus",
                    "y": 27
                  },
                  {
                    "x": "car",
                    "y": 124
                  },
                  {
                    "x": "moto",
                    "y": 262
                  },
                  {
                    "x": "bicycle",
                    "y": 217
                  },
                  {
                    "x": "horse",
                    "y": 220
                  },
                  {
                    "x": "skateboard",
                    "y": 130
                  },
                  {
                    "x": "others",
                    "y": 164
                  }
                ]
              }
            ]
          };
    } else {
        return undefined;
    }
}