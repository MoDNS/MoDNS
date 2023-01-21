import { Divider, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import React from 'react';

import MainBox from '../Components/MainBox';
import DropDown from '../Components/DropDown';


const Mods = () => {
    const theme = useTheme();

    return (
        <MainBox
            title={"Mods"}
            divider
        >
            {/* <ToggleButtonGroup>
                <ToggleButton>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                        Sequential
                    </Typography>
                </ToggleButton>
                <ToggleButton >
                    <Typography sx={{ color: theme.palette.text.primary }}>
                        Overview
                    </Typography>
                </ToggleButton>
            </ToggleButtonGroup> */}

            <div style={{ overflowY: 'auto',  margin: 10 }} >
                
                <DropDown title={"Listeners"} >
                    test item 1
                </DropDown>

                <DropDown title={"Interceptors"} >
                    test item 2
                </DropDown>

                <DropDown title={"Resolvers"} >
                    test item 3
                </DropDown>

                <DropDown title={"Validators"} >
                    test item 4
                </DropDown>
                
                <DropDown title={"Inspectors"} >
                    test item 5
                </DropDown>

            </div>

        </MainBox>
    );
};

export default Mods;