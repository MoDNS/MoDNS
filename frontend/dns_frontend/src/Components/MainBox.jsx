import { Box } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import Title from './Title';


const MainBox = ({ children, sx, title, noDivider, titleCentered }) => {

    const pt = !noDivider ? 20 : 0;
    const pb = !noDivider ? 30 : 0;

    return (
            <Box
                sx={{
                    backgroundColor: 'primary.main',
                    padding: 6,
                    paddingTop: 4,
                    overflow: 'hidden',
                    ...sx
                }}
            >
                <Title titleCentered={titleCentered} noDivider={noDivider}>
                    {title}
                </Title>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: pt, paddingBottom: pb, }} >
                    {children}
                </div>
            </Box>
    );
};

export default MainBox;

MainBox.propTypes = {
    children: PropTypes.any,
    sx: PropTypes.object,
    title: PropTypes.string,
    noDivider: PropTypes.bool,
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
    noDivider: false,
    titleCentered: false,
};