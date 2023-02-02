import React from 'react';

import MainBox from '../Components/MainBox';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import SequentialView from '../Components/Plugins/SequentialView';
import Overview from '../Components/Plugins/Overview';
import { getPluginList } from '../API/getsetAPI';
import { getPluginViewStorage, setPluginViewStorage } from '../scripts/getsetLocalStorage';


const Plugins = () => {

    const [view, setView] = useState(getPluginViewStorage());

    const handleViewSwitch = (e, newView) => {
        if (newView != null) {
            setView(newView);
            setPluginViewStorage(newView);
        }
    }
    
    const pluginList = getPluginList();

    const listenerList = getPluginList('listener');
    const interceptorList = getPluginList('interceptor');
    const resolverList = getPluginList('resolver');
    const validatorList = getPluginList('validator');
    const inspectorList = getPluginList('inspector');
    

    //////////////// Plugin Enabled Dict ////////////////
    let enabledNess = {}
    pluginList.forEach((plugin) => {
        enabledNess[plugin.uuid] = plugin.enabled;
    });

    const [pluginState, setPluginState] = useState(enabledNess);

    const togglePlugin = (uuid) => {
        let dict = pluginState;
        dict[uuid] = !dict[uuid];
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
                onChange={handleViewSwitch}
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

            { view === 's' ? 
                <SequentialView togglePlugin={togglePlugin} pluginState={pluginState} listenerList={listenerList} interceptorList={interceptorList} resolverList={resolverList} validatorList={validatorList} inspectorList={inspectorList} /> 
                : 
                <Overview togglePlugin={togglePlugin} pluginState={pluginState} pluginList={pluginList} />
            }

        </MainBox>
    );
};

export default Plugins;

