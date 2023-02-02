import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Icon, Typography } from '@mui/material';
import { PropTypes } from 'prop-types';
import { useEffect } from 'react';


const DropDown = ({ x, expanded, toggleSelf, title, description, children }) => {

    useEffect(() => {
    }, [expanded]);

    return (
        <Accordion
            expanded={expanded}
            sx={{
                paddingRight: 2,
            }}
        >
            <AccordionSummary
                sx={{ borderBottom: '1px solid' }}
                onClick={() => toggleSelf(x)}
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
    x: PropTypes.number,
    expanded: PropTypes.bool,
    toggleSelf: PropTypes.func,
    title: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.any,
};

DropDown.defaultProps = {
    expanded: false,
    toggleSelf: () => {},
    title: "Insert Title",
    description: "Accordion Description",
    children: null,
};
