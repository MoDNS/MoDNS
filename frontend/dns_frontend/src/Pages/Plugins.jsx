import React from 'react';

import MainBox from '../Components/MainBox';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import SequentialView from '../Components/Plugins/SequentialView';
import Overview from '../Components/Plugins/Overview';
import { enabledisableMod, getPluginList } from '../API/getsetAPI';
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
    

    //////////////// Plugin Enabled Dict ////////////////
    // pulls out the status of each plugin installed
    // make dictionary of plugins enabled/disabled statuses
    let pluginStatesDict = {}
    pluginList.forEach((plugin) => {
        pluginStatesDict[plugin.uuid] = plugin.enabled;
    });

    const [pluginStates, setPluginState] = useState(pluginStatesDict);

    // toggle plugin function, toggles the enabled/disabled status of a plugin with the given uuid
    const togglePlugin = (uuid) => {
        let dict = pluginStates;
        dict[uuid] = !dict[uuid];
        enabledisableMod(uuid, dict[uuid]);
        setPluginState({...dict});
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
                        togglePlugin={togglePlugin}             // toggle plugin function passed down
                        pluginStates={pluginStates}             // plugin state dictionary based on uuids
                        // lists of plugins that imlement each module
                        listenerList={listenerList} 
                        interceptorList={interceptorList} 
                        resolverList={resolverList} 
                        validatorList={validatorList} 
                        inspectorList={inspectorList} 
                    /> 
                    : 
                    <Overview 
                        togglePlugin={togglePlugin}             // toggle plugin function passed down
                        pluginStates={pluginStates}             // plugin state dictionary based on uuids

                        pluginList={pluginList}                 // list of all plugins
                    />
            }

        </MainBox>
    );
};

export default Plugins;

