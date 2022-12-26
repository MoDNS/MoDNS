import { Box } from '@mui/material';
import React from 'react';

import themes from '../themes';

const MainBox = ({ children, sx }) => {
    return (
        <Box
            sx={{
                backgroundColor: themes.theme1.background,
                height: '100vh',
                width: '100vw',
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    backgroundColor: themes.theme1.primary,
                    width: 1400,
                    height: 600,
                    margin: 'auto',
                    marginTop: 17,
                    overflow:'auto',
                    ...sx,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainBox;