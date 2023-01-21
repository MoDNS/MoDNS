import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Icon, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';


const DropDown = ({ title, description, children }) => {

    return (
        <Accordion
            disableGutters
            square
            sx={{
                '&:before': {
                    display: 'none',
                }
            }}
        >
            <AccordionSummary
                sx={{ borderBottom: '1px solid' }}
                expandIcon={
                    <Icon sx={{ fontSize: 30, }} >
                        <ExpandMoreIcon sx={{ fontSize: 30, padding: 0 }} />
                    </Icon>
                }
            >
                <Typography 
                    fontSize={30}
                    sx={{ width: '30%', }}
                >
                    {title}
                </Typography>
                <Typography 
                    sx={{ marginTop: 'auto', marginBottom: 'auto', }}
                >
                    {description}
                </Typography>
            </AccordionSummary>     
            <AccordionDetails >
                {children}  
            </AccordionDetails>
        </Accordion>
    );
};

export default DropDown;


DropDown.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.any,
};

DropDown.defaultProps = {
    title: "Insert Title",
    description: "Accordion Description",
    children: null,
};
