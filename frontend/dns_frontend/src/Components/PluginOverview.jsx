import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { enabledisableMod } from '../API/getsetAPI';
import SettingsDialog from './SettingsDialog';

const PluginOverview = ({ uuid, name, description, home, modules, interceptPosition, enabled }) => {

    const theme = useTheme();
    const [modEnabled, setModEnabled] = useState(enabled);
    const [dialogOpen, setDialogStatus] = useState(false);

    const handleModSwitch = () => {
        enabledisableMod(uuid, !modEnabled);
        setModEnabled(!modEnabled);
    }

    const listModules = () => {
        let output = "";
        const num = modules.length;

        for(var i = 0; i < num; i++) {
            output += modules[i].charAt(0).toUpperCase() + modules[i].slice(1);
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
                marginRight: 2,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        sx={{ fontSize: 35, flexShrink: 0, }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        noWrap={false}
                        sx={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'right', flexGrow: 1, padding: 1, }}
                    >
                        {description}
                    </Typography>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        fontWeight={"bold"}
                        marginRight={2}
                    >
                        modules:
                    </Typography>
                    <Typography
                    > 
                        {
                        listModules()
                        }
                    </Typography>
                </div>
            </div>
            <IconButton
                sx={{ marginLeft: 1, }}
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
                modules={modules}
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                handleModSwitch={handleModSwitch}
                modEnabled={modEnabled}
                 />
        </Box>
    );
};

export default PluginOverview;

PluginOverview.propTypes = {
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    home: PropTypes.string.isRequired,
    modules: PropTypes.array.isRequired,
    interceptPosition: PropTypes.number,
    enabled: PropTypes.bool.isRequired,
};
