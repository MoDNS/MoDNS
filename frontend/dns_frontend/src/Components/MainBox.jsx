import { Box } from '@mui/material';
import React from 'react';

// import themes from '../themes';

const MainBox = ({ children, sx }) => {
    return (
        <Box
            sx={{
                backgroundColor: 'background',
                height: '100vh',
                width: '100vw',
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    width: 1400,
                    height: .85,
                    margin: 'auto',
                    marginTop: '6%',
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