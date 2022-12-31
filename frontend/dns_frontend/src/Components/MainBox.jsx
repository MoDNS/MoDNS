import { Box } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';


const MainBox = ({ children, sx }) => {

    return (
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    padding: 6,
                    paddingTop: 4,
                    display: 'flex',
                    flexFlow: 'column',
                    ...sx
                }}
            >
                {children}
            </Box>
    );
};

export default MainBox;

MainBox.propTypes = {
    sx: PropTypes.object,
};

MainBox.defaultProps = {
    children: null,
    sx: {
        position: 'absolute',
        top: 100,
        bottom: 0,
        left: 50,
        right: 50,
        minWidth: 450,
    }
};