import { TextField } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';


const InputField = ({ sx, ...other }) => {
    return (
        <TextField 
            variant='standard'
            {...other}
            sx={{  
                '& label.Mui-focused': {
                    color: 'text.primary',
                },
                "& .MuiInput-underline:after": {
                    borderBottomColor: 'text.primary',
                },
                "& .MuiInput-underline:before": {
                    borderBottomColor: 'text.primary',
                },
                "& .MuiInput-root:hover::before": {
                    borderBottomColor: 'text.secondary',
                },
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