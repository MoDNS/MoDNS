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
                <SequentialView pluginList={pluginList} listenerList={listenerList} interceptorList={interceptorList} resolverList={resolverList} validatorList={validatorList} inspectorList={inspectorList} /> 
                : 
                <Overview pluginList={pluginList} />
            }

        </MainBox>
    );
};

export default Plugins;

