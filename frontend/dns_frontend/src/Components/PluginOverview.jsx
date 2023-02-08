import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import SettingsDialog from './SettingsDialog';

import defaultPluginLogo from '../images/default_plugin_logo.svg';

const PluginOverview = ({ uuid, friendlyName, description, home, modules, interceptPosition, numInterceptors, pluginState, togglePlugin, setPluginLists }) => {

    const theme = useTheme();

    const [dialogOpen, setDialogStatus] = useState(false);

    // creates list of modules for plugin to display
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
            <img src={defaultPluginLogo} alt="No Logo Found" width={65} height={65} style={{ margin: 10, marginLeft: 0 }}/>         { /* dummy logo */ }
            
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1}} >
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        sx={{ fontSize: 35, flexShrink: 0, }}
                    >
                        {friendlyName}
                    </Typography>
                    <Typography
                        noWrap={false}
                        sx={{ marginTop: 'auto', marginBottom: 'auto', padding: 1, width: '50%', marginLeft: 'auto' }}
                    >
                        {description}
                    </Typography>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        fontWeight={"bold"}
                        marginRight={2}
                    >
                        Modules:
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
                sx={{ marginLeft: 1, marginY: 'auto' }}
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
                        checked={pluginState}
                        onChange={() => togglePlugin(uuid, modules[0])}         // toggles the plugin with this uuid
                    />
                } 
                sx={{ marginRight: 0, marginY: 'auto',marginLeft: 1 }}
            />



            <SettingsDialog
                uuid={uuid}
                friendlyName={friendlyName}
                description={description}
                home={home}
                modules={modules}
                interceptPosition={interceptPosition}
                numInterceptors={numInterceptors}
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                togglePlugin={togglePlugin}                         // pass the toggle plugin function to the settings dialog box
                pluginState={pluginState}                           // pass the plugin state to the dialog box
                setPluginLists={setPluginLists}                     // set order of rows
            />
        </Box>
    );
};

export default PluginOverview;

PluginOverview.propTypes = {
    uuid: PropTypes.string.isRequired,                  // plugin attributes
    friendlyName: PropTypes.string.isRequired,          //
    description: PropTypes.string.isRequired,           //
    home: PropTypes.string.isRequired,                  //
    modules: PropTypes.array.isRequired,                //
    interceptPosition: PropTypes.number,                //
    numInterceptors: PropTypes.number.isRequired,       // total number of interceptor plugins installed
    togglePlugin: PropTypes.func.isRequired,            // function to enable / disable a plugin
    pluginState: PropTypes.bool.isRequired,             // enabled / disabled state of plugin
    setPluginLists: PropTypes.func.isRequired,          // reorder plugins that allow drag n drop
};
