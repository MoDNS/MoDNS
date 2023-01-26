import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { enabledisableMod } from '../../API/getsetAPI';
import SettingsDialog from '../SettingsDialog';

const ModOverview = ({ uuid, name, description, home, implementations, enabled }) => {

    const theme = useTheme();
    const [modEnabled, setModEnabled] = useState(enabled);
    const [dialogOpen, setDialogStatus] = useState(false);

    const handleModSwitch = () => {
        enabledisableMod(uuid, !modEnabled);
        setModEnabled(!modEnabled);
    }

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
                onClick={() => setDialogStatus(true)}
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
                control={
                    <Switch 
                        checked={modEnabled}
                        onChange={handleModSwitch}
                    />
                } 
                sx={{ marginRight: 0, marginY: 'auto',marginLeft: 1 }}
            />



            <SettingsDialog
                uuid={uuid}
                name={name}
                description={description}
                home={home}
                implementations={implementations}
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                handleModSwitch={handleModSwitch}
                modEnabled={modEnabled}
                 />
        </Box>
    );
};

export default ModOverview;

ModOverview.propTypes = {
    uuid: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    home: PropTypes.string,
    implementations: PropTypes.array,
    enabled: PropTypes.bool,
};

ModOverview.defaultProps = {
    uuid: 'default8-uuid-48aa-825f-23ba6b212fc3',
    name: "Mod Name",
    description: "description of mod capabilities and functions description of mod capabilities and functions description of mod capabilities and functions",
    home: "home/directory",
    implementations: ["impl 1", "impl 2", "impl 3", "impl 4", "impl 5"],
    enabled: false,
};