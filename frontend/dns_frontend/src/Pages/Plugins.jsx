import React, { useRef } from 'react';

import MainBox from '../Components/MainBox';
import { Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import SequentialView from '../Components/Plugins/SequentialView';
import Overview from '../Components/Plugins/Overview';
import { enabledisablePlugin, getPluginDict, setPluginOrder } from '../API/getsetAPI';
import { getPluginViewStorage, setPluginViewStorage } from '../scripts/getsetLocalStorage';


const Plugins = => {

    // sets sequential or overview
    const [view, setView] = useState(getPluginViewStorage());

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
    const pluginDicts = {
        'all' : getPluginDict(),
        'listener': getPluginDict('listener'),
        'interceptor': getPluginDict('interceptor'),
        'resolver': getPluginDict('resolver'),
        'validator': getPluginDict('validator'),
        'inspector': getPluginDict('inspector'),
    }

    /////////////////////////////////////////////////////// ENABLE / DISABLE ///////////////////////////////////////////////////////
    let pluginsEnabled = {}
    Object.keys(pluginDicts['all']).forEach(uuid => {
        pluginsEnabled[uuid] = pluginDicts['all'][uuid]['enabled'];
    });
    const [pluginsEnabledDict, setPluginsEnabledDict] = useState(pluginsEnabled);
    pluginsEnabled = null;

    const togglePlugin = (uuid) => {
        let pluginsEnabled = pluginsEnabledDict;
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
    
    const [interceptorUuidOrder, setInterceptorUuidOrder] = useState(Object.keys(pluginDicts['interceptor']));

    const setInterceptOrder = (old_pos, new_pos) => {
        let uuidList = interceptorUuidOrder;
        let uuid = uuidList[old_pos];
        uuidList.splice(old_pos, 1);
        uuidList.splice(new_pos, 0, uuid);

        setInterceptorUuidOrder([...uuidList]);
        setPluginOrder(uuidList);
    }

    const inputFile = useRef(null);

    return (
        <MainBox
            title={"Plugins"}
            divider
        >
            <div style={{ display: 'flex'}}>
                <input ref={inputFile} type='file' id='file' style={{ display: 'none' }} />
                <Button 
                    variant='contained'
                    onClick={() => inputFile.current.click()}
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
                        numInterceptors={Object.keys(pluginDicts['interceptor']).length}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}

                    /> 
                    : 
                    <Overview 
                        pluginDict={pluginDicts['all']}                         // list of all plugins                        
                        numInterceptors={Object.keys(pluginDicts['interceptor']).length}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}

                    />
            }

        </MainBox>
    );
};

export default Plugins;

