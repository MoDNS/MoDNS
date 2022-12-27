import { Box, Typography } from '@mui/material';
import React from 'react';

// import themes from '../themes';

const Title = ({children, sx, divider}) => {
    return (
        <>
            <Typography
                    variant='h3'
                    noWrap
                    sx={{
                        marginLeft: 3,
                        marginRight: 3,
                        marginTop: 2,
                        color: 'text.main',
                        ...sx
                    }}
                    >
                    {children}
            </Typography>
            {divider && <Box 
                sx={{
                    color: 'text.main',
                    border: 2,  
                    margins: 0,
                    height: '0',
                    borderTop: 0,
                    borderLeft: 0,
                    borderRight: 0,
                    marginLeft: 2,
                    marginRight: 2
                }} 
            />}
        </>
    );
};

export default Title;