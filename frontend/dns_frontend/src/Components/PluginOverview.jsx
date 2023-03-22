import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import SettingsDialog from './SettingsDialog';

import defaultPluginLogo from '../images/default_plugin_logo.svg';

const PluginOverview = ({ uuid, friendlyName, description, home, is_listener, is_interceptor, is_resolver, is_validator, is_inspector, interceptPosition, setInterceptOrder, numInterceptors, pluginState, togglePlugin }) => {

    const theme = useTheme();

    const [dialogOpen, setDialogStatus] = useState(false);

    // creates list of modules for plugin to display
    const listModules = () => {
        let output = [];
        if (is_listener) {
            output.push("Listener");
        }
        if (is_interceptor) {
            output.push("Interceptor");
        }
        if (is_resolver) {
            output.push("Resolver");
        }
        if (is_validator) {
            output.push("Validator");
        }
        if (is_inspector) {
            output.push("Inspector");
        }
        
        return output.join(", ");
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
                        onChange={() => togglePlugin(uuid)}         // toggles the plugin with this uuid
                    />
                } 
                sx={{ marginRight: 0, marginY: 'auto',marginLeft: 1 }}
            />



            <SettingsDialog
                uuid={uuid}
                friendlyName={friendlyName}
                description={description}
                home={home}
                is_listener={is_listener}
                is_interceptor={is_interceptor}
                is_resolver={is_resolver}
                is_validator={is_validator}
                is_inspector={is_inspector}
                interceptPosition={interceptPosition}
                numInterceptors={numInterceptors}
                setInterceptOrder={setInterceptOrder}               // set order of rows
                dialogOpen={dialogOpen}
                pluginState={pluginState}                           // pass the plugin state to the dialog box
                setDialogStatus={setDialogStatus}
                togglePlugin={togglePlugin}                         // pass the toggle plugin function to the settings dialog box
            />
        </Box>
    );
};

export default PluginOverview;

PluginOverview.propTypes = {
    uuid: PropTypes.string.isRequired,                  // Plugin info
    friendlyName: PropTypes.string.isRequired,          //
    description: PropTypes.string.isRequired,           //
    home: PropTypes.string.isRequired,                  //
    is_listener: PropTypes.bool.isRequired,
    is_interceptor: PropTypes.bool.isRequired,
    is_resolver: PropTypes.bool.isRequired,
    is_validator: PropTypes.bool.isRequired,
    is_inspector: PropTypes.bool.isRequired,
    interceptPosition: PropTypes.number,                // Intercept module position
    setInterceptOrder: PropTypes.func.isRequired,       // Change interceptor plugin order
    numInterceptors: PropTypes.number.isRequired,       // Total number of interceptors implemented
    pluginState: PropTypes.bool.isRequired,             // Plugin enabled or disabled
    togglePlugin: PropTypes.func.isRequired,            // Function to toggle a plugin
};


