import React from 'react';

import MainBox from '../Components/MainBox';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
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
    

    // gets plugin lists from api
    const pluginList = getPluginList();
    const listenerList = getPluginList('listener');
    const interceptorList = getPluginList('interceptor');
    const resolverList = getPluginList('resolver');
    const validatorList = getPluginList('validator');
    const inspectorList = getPluginList('inspector');
    

    ///////////////// Plugin Lists /////////////////
    
    const [rowLists, setRowList] = useState({
        'listener': listenerList,
        'interceptor': interceptorList,
        'resolver': resolverList,
        'validator': validatorList,
        'inspector': inspectorList,
    });

    const setRowLists = (listType, newList) => {
        let rowListDict = rowLists;
        rowListDict[listType] = newList;
        let uuidList = [];
        setRowList({...rowListDict});
        newList.forEach(plugin => {
            uuidList.push(plugin.uuid);
        });
        setPluginOrder(uuidList);

    };


    //////////////// Plugin Enabled Dict ////////////////
    // pulls out the status of each plugin installed
    // make dictionary of plugins enabled/disabled statuses
    let pluginStatesDict = {}
    pluginList.forEach((plugin) => {
        pluginStatesDict[plugin.uuid] = plugin.enabled;
    });

    const [pluginStates, setPluginState] = useState(pluginStatesDict);
    
    // toggle plugin function, toggles the enabled/disabled status of a plugin with the given uuid
    const onlyOneEnabledDict = {
        'listener': true,
        'resolver': true,
        'interceptor': false,
        'validator': false,
        'inspector': false,
    }

    const togglePlugin = (uuid) => {
        let dict = pluginStates;
        dict[uuid] = !dict[uuid];
        enabledisableMod(uuid, dict[uuid]);
        setPluginState({...dict});
    }

    const disableOthers = (uuid, modules) => {
        for (var module of modules) {
            if (onlyOneEnabledDict[module]) {
                rowLists[module].forEach(plugin => {
                    if (plugin.uuid !== uuid && pluginStates[plugin.uuid]) {
                        togglePlugin(plugin.uuid);
                    }
                });
            }
        }
    }

    

    const checkOthersEnabled = (uuid, listType) => {
        if (pluginStates[uuid]) {
            togglePlugin(uuid);
            return;
        }
        let modules;
        for (var i = 0; i < rowLists[listType].length; i++) {
            if (rowLists[listType][i].uuid === uuid) {
                modules = rowLists[listType][i].modules;
                break;
            }
        }
        disableOthers(uuid, modules)
        togglePlugin(uuid);
        
      }

    



    return (
        <MainBox
            title={"Plugins"}
            divider
        >
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

            { 
                // shoes sequential or overview
                view === 's' ? 
                    <SequentialView 
                        togglePlugin={checkOthersEnabled}             // toggle plugin function passed down
                        pluginStates={pluginStates}                   // plugin state dictionary based on uuids
                        // lists of plugins that imlement each module
                        listenerList={listenerList} 
                        interceptorList={interceptorList} 
                        resolverList={resolverList} 
                        validatorList={validatorList} 
                        inspectorList={inspectorList} 
                        // drag and drop
                        rowLists={rowLists}
                        setRowLists={setRowLists}
                        onlyOneEnabledDict={onlyOneEnabledDict}
                    /> 
                    : 
                    <Overview 
                        togglePlugin={checkOthersEnabled}             // toggle plugin function passed down
                        pluginStates={pluginStates}                   // plugin state dictionary based on uuids

                        pluginList={pluginList}                 // list of all plugins
                        checkOthersEnabled={checkOthersEnabled}
                        onlyOneEnabledDict={onlyOneEnabledDict}
                    />
            }

        </MainBox>
    );
};

export default Plugins;

