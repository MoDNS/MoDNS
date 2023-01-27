import React from 'react';

import MainBox from '../Components/MainBox';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import SequentialView from '../Components/Mods/SequentialView';
import Overview from '../Components/Mods/Overview';
import { getModList } from '../API/getsetAPI';


const Mods = () => {

    const [view, setView] = useState(0);

    const handleViewSwitch = (e, newView) => {
        if (newView != null) {
            setView(newView);
        }
    }
    
    const modList = getModList();

    return (
        <MainBox
            title={"Mods"}
            divider
        >
            <ToggleButtonGroup
                sx={{ marginLeft: 'auto', width: 'fit' }} 
                value={view}
                exclusive
                onChange={handleViewSwitch}
            >
                <ToggleButton
                    value={0}
                    sx={{ paddingY: 0.2 }}
                >
                    <Typography sx={{ color: 'text.primary' }}>
                        Sequential
                    </Typography>
                </ToggleButton>
                <ToggleButton 
                    sx={{ paddingY: 0.2 }}
                    value={1}
                >
                    <Typography sx={{ color: 'text.primary' }}>
                        Overview
                    </Typography>
                </ToggleButton>
            </ToggleButtonGroup>

            { !view ? 
                <SequentialView modList={modList} /> 
                : 
                <Overview modList={modList} />
            }

        </MainBox>
    );
};

export default Mods;

