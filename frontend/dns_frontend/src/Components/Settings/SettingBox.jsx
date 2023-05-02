import React from 'react';
import { PropTypes } from 'prop-types';
import { Box, useTheme, Typography }from '@mui/material';

const SettingBox = ({ children, title, noFullWidth }) => {
    
    const theme = useTheme();

    return (
        <Box 
            sx={{
                borderRadius: 8, 
                border: `4px solid ${theme.palette.primary.dark}`,
                padding: 3,
                marginBottom: 2,
                width: '99%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowX: 'hidden',
            }}
        >
            <Typography
                sx={{
                    fontSize: 35,
                }}
            >
                {title}
            </Typography>
            <div style={{ width: noFullWidth ? "auto" : '100%' }} >
                {children}
            </div>
        </Box>
    );
};

export default SettingBox;

SettingBox.propTypes = {
    title: PropTypes.string,
    noFullWidth: PropTypes.bool
};

SettingBox.defaultProps = {
    noFullWidth: false,
};