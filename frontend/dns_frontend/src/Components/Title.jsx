import { Divider, Typography } from '@mui/material';
import React from 'react';

// import themes from '../themes';

const Title = ({children, sx, divider}) => {
    return (
        <>
            <Typography
                    variant='h3'
                    noWrap
                    sx={{
                        marginLeft: 1,
                        marginRight: 1,
                        marginTop: 0,
                        color: 'text.main',
                        ...sx
                    }}
                    >
                    {children}
            </Typography>
            {divider && <Divider sx={{ marginLeft: 0, marginRight: 0, marginTop: 0.5, }} />}
        </>
    );
};

export default Title;