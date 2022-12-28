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
                // paddingTop: 7,
                display: 'flex',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    width: .95,
                    height: .95,
                    margin: 'auto',
                    marginTop: '6%',
                    overflow:'auto',
                    alignSelf: 'flex-end',
                    ...sx
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default MainBox;