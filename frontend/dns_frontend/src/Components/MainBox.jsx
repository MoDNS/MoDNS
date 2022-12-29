import { Box } from '@mui/material';
import React from 'react';


const MainBox = ({ children, sx }) => {
    return (
        <Box
            sx={{
                backgroundColor: 'background',
                justifyContent:'center',
                height: '100vh',
                width: '100vw',
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    width: .95,
                    height: .95,
                    minWidth: 450,
                    marginTop: '6%',
                    padding: '1.5%',
                    ...sx
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainBox;