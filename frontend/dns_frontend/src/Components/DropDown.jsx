import { Box } from '@mui/material';
import React from 'react';
import Title from './Title';

const DropDown = ({ children, sx, title, divider, titleCentered }) => {

    return (
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    // padding: 6,
                    paddingTop: 4,
                    overflow: 'hidden',
                    border: "1px solid white",
                    height: 150,
                    display: 'flex', 
                    flexDirection: 'row',
                    ...sx
                }}
            >
                <Title 
                    titleCentered={titleCentered} 
                    divider={divider} 
                    sx={{
                        // padding: 2,
                    }}>
                    {title}
                </Title>
                <div >
                    {children}
                </div>
            </Box>
    );
};

export default DropDown;
