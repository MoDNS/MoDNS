import { Box } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import Title from './Title';


const MainBox = ({ children, sx, title, divider, titleCentered }) => {

    const pt = divider ? 20 : 0;
    const pb = divider ? 30 : 0;

    return (
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    padding: 6,
                    paddingTop: 4,
                    ...sx
                }}
            >
                <Title titleCentered={titleCentered} divider={divider}>
                    {title}
                </Title>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: pt, paddingBottom: pb, overflowY: 'auto', overflowX: 'hidden' }} >
                    {children}
                </div>
            </Box>
    );
};

export default MainBox;

MainBox.propTypes = {
    children: PropTypes.any,
    sx: PropTypes.object,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    divider: PropTypes.bool,
    titleCentered: PropTypes.bool,
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
    },
    title: 'Title Here',
    divider: false,
    titleCentered: false,
};