import React, { useRef } from 'react';

import MainBox from '../Components/MainBox';
import { Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import SequentialView from '../Components/Plugins/SequentialView';
import Overview from '../Components/Plugins/Overview';
import { enabledisableMod, getPluginList, setPluginOrder } from '../API/getsetAPI';
import { getPluginViewStorage, setPluginViewStorage } from '../scripts/getsetLocalStorage';


const Plugins = () => {

    // sets sequential or overview
    const [view, setView] = useState(getPluginViewStorage());

    // switch for sequential or overview
    const handleViewSwitch = (e, newView) => {
        if (newView != null) {
            setView(newView);
            setPluginViewStorage(newView);
        }
    }
    
    ////////////////////// Plugin Lists //////////////////////
    const [pluginLists, setPluginList] = useState({
        'all' : getPluginList(),
        'listener': getPluginList('listener'),
        'interceptor': getPluginList('interceptor'),
        'resolver': getPluginList('resolver'),
        'validator': getPluginList('validator'),
        'inspector': getPluginList('inspector'),
    });


    // get the order of the interceptors
    let interceptorOrderDict = {}
    for (let i = 0; i < pluginLists['interceptor'].length; i++) {
        interceptorOrderDict[pluginLists['interceptor'][i].uuid] = i + 1;
    }

    // swap rows in list
    const setPluginLists = (listType, old_pos, new_pos) => {
        let pluginListCopy = [...pluginLists[listType]];

        const itemCopy = pluginListCopy[old_pos]
        pluginListCopy.splice(old_pos, 1);
        pluginListCopy.splice(new_pos, 0, itemCopy);

        let pluginListDict = pluginLists;
        pluginListDict[listType] = pluginListCopy;
        let uuidList = [];
        setPluginList({...pluginListDict});
        for (let i = 0; i < pluginListCopy.length; i++) {
            uuidList.push(pluginListCopy[i].uuid);
        }
        setPluginOrder(uuidList);
        for (let i = 0; i < uuidList.length; i++) {
            interceptorOrderDict[uuidList[i]] = i + 1;
        }

    };


    //////////////// Plugin Enabled Dict ////////////////
    // pulls out the status of each plugin installed
    // make dictionary of plugins enabled/disabled statuses
    let pluginStatesDict = {}
    pluginLists['all'].forEach((plugin) => {
        pluginStatesDict[plugin.uuid] = plugin.enabled;
    });

    const [pluginStates, setPluginState] = useState(pluginStatesDict);
    
    // dict of which types of modules can have only one enabled plugin
    const onlyOneEnabledDict = {
        'listener': true,
        'resolver': true,
        'interceptor': false,
        'validator': false,
        'inspector': false,
    }
    
    // toggle plugin function, toggles the enabled/disabled status of a plugin with the given uuid
    const togglePlugin = (uuid) => {
        let dict = pluginStates;
        dict[uuid] = !dict[uuid];
        enabledisableMod(uuid, dict[uuid]);
        setPluginState({...dict});
    }

    // disables other plugins when enabling plugins that can have only one plugin enabled
    const disableOthers = (uuid, modules) => {
        for (var module of modules) {
            if (onlyOneEnabledDict[module]) {
                pluginLists[module].forEach(plugin => {
                    if (plugin.uuid !== uuid && pluginStates[plugin.uuid]) {
                        togglePlugin(plugin.uuid);
                    }
                });
            }
        }
    }

    // check the other types of modules that this plugin implements for modules that can only have one enabled plugin
    const checkOthersEnabled = (uuid, listType) => {
        if (pluginStates[uuid]) {
            togglePlugin(uuid);
            return;
        }
        let modules;
        for (var i = 0; i < pluginLists[listType].length; i++) {
            if (pluginLists[listType][i].uuid === uuid) {
                modules = pluginLists[listType][i].modules;
                break;
            }
        }
        disableOthers(uuid, modules)
        togglePlugin(uuid);
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
                    onChange={handleViewSwitch}                     // handles the switching between sequential and overview
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
                        togglePlugin={checkOthersEnabled}             // toggle plugin function passed down
                        pluginStates={pluginStates}                   // plugin state dictionary based on uuids
                        // lists of plugins that imlement each module
                        pluginLists={pluginLists}
                        setPluginLists={setPluginLists}
                        numInterceptors={pluginLists['interceptor'].length}
                        interceptorOrderDict={interceptorOrderDict}

                    /> 
                    : 
                    <Overview 
                        togglePlugin={checkOthersEnabled}               // toggle plugin function passed down
                        pluginStates={pluginStates}                     // plugin state dictionary based on uuids
                        numInterceptors={pluginLists['interceptor'].length}
                        pluginList={pluginLists['all']}                 // list of all plugins                        
                        setPluginLists={setPluginLists}
                        interceptorOrderDict={interceptorOrderDict}

                    />
            }

        </MainBox>
    );
};

export default Plugins;

