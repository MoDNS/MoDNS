import { TextField } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';


const InputField = ({ sx, ...other }) => {
    return (
        <TextField 
            variant='standard'
            {...other}
            sx={{  
                ...sx,
            }}    
        />
    );
};

export default InputField;

InputField.propTypes = {
    sx: PropTypes.object,
    other: PropTypes.any,
};

InputField.defaultProps = {
    sx: {},
    other: null,
};