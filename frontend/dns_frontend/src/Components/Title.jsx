import { Divider, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';

const Title = ({children, sx, divider, titleCentered}) => {
    return (
        <>
            <Typography
                    variant='h3'
                    noWrap
                    sx={{
                        marginLeft: 1,
                        marginRight: 1,
                        marginTop: 0,
                        textAlign: `${ titleCentered ? 'center' : 'left'}`,
                        ...sx
                    }}
                    >
                    {children}
            </Typography>
            { divider && <Divider sx={{ marginLeft: 0, marginRight: 0, marginTop: 0.5, }} /> }
        </>
    );
};

export default Title;

Title.propTypes = {
    children: PropTypes.any,
    sx: PropTypes.object,
    divider: PropTypes.bool,
    titleCentered: PropTypes.bool,
};

Title.defaultProps = {
    children: null,
    sx: {},
    divider: false,
    titleCentered: false,
};