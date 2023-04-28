import React, { useRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';


import MainBox from '../Components/MainBox';
import { Button, ToggleButton, ToggleButtonGroup, Typography, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import SequentialView from '../Components/Plugins/SequentialView';
import Overview from '../Components/Plugins/Overview';
import { enabledisablePlugin, getPluginCustomSettings, getPluginDict, installPlugin, setInterceptOrderAPI } from '../API/getsetAPI';
import { getPluginViewStorage, setPluginViewStorage } from '../scripts/getsetLocalStorage';


const Plugins = () => {

    const [loading, setLoading] = useState(true);

    // sets sequential or overview
    const [view, setView] = useState(getPluginViewStorage());

    const [pluginDicts, setPluginDicts] = useState({});
    const [settingsPagesDict, setSettingsPagesDict] = useState({});

    // switch for sequential or overview
    const handleViewSwitch = (e, newView) => {
        if (newView != null) {
            setView(newView);
            setPluginViewStorage(newView);
        }
    }

    
    // dict of which types of modules can have only one enabled plugin
    const onlyOneEnabledDict = {
        'listener': true,
        'interceptor': false,
        'resolver': true,
        'validator': false,
        'inspector': false,
    }


    ////////////////////// Plugin Lists //////////////////////

    const makePluginDict = async () => {
        return await {
            'all': await getPluginDict(),
            'listener': await getPluginDict('listener'),
            'interceptor': await getPluginDict('interceptor'),
            'resolver': await getPluginDict('resolver'),
            'validator': await getPluginDict('validator'),
            'inspector': await getPluginDict('inspector'),
        }
    }

    /////////////////////////////////////////////////////// CUSTOM SETTINGS //////////////////////////////////////////////////////
    const makeSettingsPageDict = async (dict) => {
        let settingsDict = {}
        Object.keys(dict).forEach(async uuid => {
            settingsDict[uuid] = await getPluginCustomSettings(uuid);
        })
        return await settingsDict;
    }

    const [pluginsEnabledDict, setPluginsEnabledDict] = useState({});

    useEffect(() => {
        makePluginDict().then(dicts => {
            setPluginDicts({...dicts})
            makeSettingsPageDict(dicts['all']).then(settingsPages => {
                setSettingsPagesDict({...settingsPages});
            })
            let pluginsEnabled = {}
            Object.keys(dicts['all'] || {}).forEach(uuid => {
                pluginsEnabled[uuid] = dicts['all'][uuid]['enabled'];
            });
            setPluginsEnabledDict({...pluginsEnabled})
            setLoading(false);
        })
    }, []);


    /////////////////////////////////////////////////////// ENABLE / DISABLE ///////////////////////////////////////////////////////

    
    const togglePlugin = (uuid) => {
        let pluginsEnabled = {...pluginsEnabledDict};
        if (!pluginsEnabled[uuid]) {
            Object.keys(onlyOneEnabledDict).forEach(module => {
                if (pluginDicts['all'][`is_${module}`] && onlyOneEnabledDict[module]) {
                    Object.keys(pluginDicts[module]).forEach(uuid2 => {
                        if (pluginsEnabled[uuid2]) {
                            pluginsEnabled[uuid2] = false;
                            enabledisablePlugin(uuid2, false);
                        }
                    });
                }
            });
        }

        let enabled = !pluginsEnabled[uuid];
        pluginsEnabled[uuid] = enabled
        setPluginsEnabledDict({...pluginsEnabled});
        enabledisablePlugin(uuid, enabled);
    }

    ////////////////////////////////////////////////////// INTERCEPTOR ORDER //////////////////////////////////////////////////////

    let keys = Object.keys(pluginDicts['interceptor'] || {});
    const [interceptorUuidOrder, setInterceptorUuidOrder] = useState([...keys]);
    keys = null;

    const setInterceptOrder = (old_pos, new_pos) => {
        let uuidList = interceptorUuidOrder;
        let uuid = uuidList[old_pos];
        uuidList.splice(old_pos, 1);
        uuidList.splice(new_pos, 0, uuid);

        setInterceptorUuidOrder([...uuidList]);
        setInterceptOrderAPI(uuidList);
    }


    //////////////////////////////////////////////////////////// MAIN ///////////////////////////////////////////////////////////
    
    const [theFile, setTheFile] = useState();

    return (
        <MainBox
            title={"Plugins"}
            divider
        >
            <div style={{ display: 'flex'}}>
                <TextField
                    inputProps={{ accept:".zip,.gzip" }}
                    onChange={ (e) => {
                        if (e.target.files) {
                            setTheFile(e.target.files[0]);
                        }
                    }}
                    type='file'
                    sx={{ marginRight: 2 }}
                />
                <Button 
                    variant='contained'
                    onClick={(e) => {
                        if (theFile) {
                            installPlugin(theFile);
                            setTheFile(null);
                        }
                    }}
                >
                    Install
                </Button>
                <ToggleButtonGroup
                    sx={{ marginLeft: 'auto', width: 'fit' }}
                    value={view}
                    exclusive
                    onChange={handleViewSwitch}                                 // handles the switching between sequential and overview
                >
                    <ToggleButton
                        value={'s'}
                        sx={{ paddingY: 0.2 }}
                    >
                        <Typography sx={{ color: 'text.primary' }}>
                            Sequential
                        </Typography>
                    </ToggleButton>
                    <ToggleButton 
                        sx={{ paddingY: 0.2 }}
                        value={'o'}
                    >
                        <Typography sx={{ color: 'text.primary' }}>
                            Overview
                        </Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            { 
                
                // shoes sequential or overview
                view === 's' ? 
                    <SequentialView 
                        pluginDicts={pluginDicts}
                        numInterceptors={Object.keys(pluginDicts['interceptor'] || {}).length}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        settingsPagesDict={settingsPagesDict}

                    /> 
                    : 
                    loading ? <div style={{ width: '100%', height: '100%', display: 'flex' }} >
                            <CircularProgress color="inherit" sx={{ margin: 'auto' }} />
                        </div> :
                        <Overview 
                            pluginDict={pluginDicts['all']}                         // list of all plugins                        
                            numInterceptors={Object.keys(pluginDicts['interceptor'] || {}).length}
                            pluginsEnabledDict={pluginsEnabledDict}
                            togglePlugin={togglePlugin}
                            interceptorUuidOrder={interceptorUuidOrder}
                            setInterceptOrder={setInterceptOrder}
                            settingsPagesDict={settingsPagesDict}

                        />
            }

        </MainBox>
    );
};

export default Plugins;

