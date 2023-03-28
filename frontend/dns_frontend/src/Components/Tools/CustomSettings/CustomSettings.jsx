import { Typography } from '@mui/material';
import React from 'react';
import ParseCustomSettings from '../../../scripts/ParseCustomSettings';

const CustomSettings = ({ jsonPage }) => {
    return (
        <>
            <Typography
                fontSize={28}
                textAlign={'center'}
            >
                Plugin Settings
            </Typography>
            <ParseCustomSettings settingsJson={jsonPage} buildMode />
        </>
    );
};

export default CustomSettings;