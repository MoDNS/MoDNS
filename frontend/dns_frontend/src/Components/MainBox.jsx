import { Box } from '@mui/material';
import React from 'react';


const MainBox = ({ children, sx }) => {
    return (
        <Box
            sx={{
                backgroundColor: 'background',
                height: '100vh',
                width: '100vw',
                paddingTop: 7,
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    width: 1400,
                    height: 600,
                    margin: 'auto',
                    marginTop: 7,
                    overflow:'auto',
                    ...sx
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainBox;