import { Typography } from '@mui/material';
import React from 'react';

import themes from '../themes';

const Title = ({children, sx}) => {
    return (
        <Typography
                variant='h3'
                noWrap
                maxWidth='false'
                sx={{
                    marginTop: 2,
                    color: themes.theme1.text,
                    ...sx
                }}
            >
                {children}
        </Typography>
    );
};

export default Title;