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
                        marginLeft: 3,
                        marginRight: 3,
                        marginTop: 2,
                        color: 'text.main',
                        ...sx
                    }}
                    >
                    {children}
            </Typography>
            {divider && <Divider sx={{ marginLeft: 3, marginRight: 3, marginTop: 0.5, }} />}
        </>
    );
};

export default Title;