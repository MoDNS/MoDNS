import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';

const ModOverview = ({ name, description, implementations }) => {
    const theme = useTheme();

    const listImplementations = () => {
        let output = "";
        const num = implementations.length;

        for(var i = 0; i < num; i++) {
            output += implementations[i];
            if (i !== num - 1) {
                output += ", ";
            }
        }
        return output;
    }


    return (
        <Box
            sx={{
                marginY: 1,
                borderRadius: 3, 
                paddingY: 1,
                paddingX: 3,
                display: 'flex',
                flexDirection: 'row',
                flexGrow: 1,
                border: `4px solid ${theme.palette.primary.dark}`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        sx={{ fontSize: 35, flexShrink: 0 }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        noWrap={false}
                        sx={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'right', flexGrow: 1 }}
                    >
                        {description}
                    </Typography>
                </div>
                <Typography
                >
                    {
                    listImplementations()
                    }
                </Typography>
            </div>
            <IconButton
                sx={{ marginLeft: 3, }}
            >
                <SettingsIcon 
                    fontSize='large' 
                    sx={{ 
                        transitionProperty: 'transform',
                        '&:hover': {
                            transform: 'rotate(90deg)',
                          },
                    }}
                />
            </IconButton>
            <FormControlLabel 
                control={<Switch />} 
                labelPlacement='top'
                sx={{ marginRight: 0, marginY: 'auto' }}
            />
        </Box>
    );
};

export default ModOverview;

ModOverview.propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    implementations: PropTypes.array,
};

ModOverview.defaultProps = {
    name: "Mod Name",
    description: "description of mod capabilities and functions",
    implementations: ["impl 1", "impl 2"],
};