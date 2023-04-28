import React from 'react';
import { PropTypes } from 'prop-types';
import { Typography } from '@mui/material';

import PluginOverview from '../PluginOverview';


const Overview = ({ pluginDict, numInterceptors, pluginsEnabledDict, togglePlugin, interceptorUuidOrder, setInterceptOrder, settingsPagesDict }) => {

    return (
            <div 
                style={{
                    margin: 10,
                    marginRight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                }}
            >
                {
                    Object.keys(pluginDict || {}).length !== 0 ?
                    Object.keys(pluginDict || {}).map((key, index) => (
                        <PluginOverview 
                            key={index} 
                            // plugin info
                            uuid={key}
                            friendlyName={pluginDict[key].friendly_name} 
                            description={pluginDict[key].description} 
                            home={pluginDict[key].home} 
                            is_listener={pluginDict[key].is_listener}
                            is_interceptor={pluginDict[key].is_interceptor}
                            is_resolver={pluginDict[key].is_resolver}
                            is_validator={pluginDict[key].is_validator}
                            is_inspector={pluginDict[key].is_inspector}
                            interceptPosition={ interceptorUuidOrder.includes(key) ? interceptorUuidOrder.indexOf(key) + 1 : null }
                            setInterceptOrder={setInterceptOrder}
                            numInterceptors={numInterceptors}
                            pluginState={pluginsEnabledDict[key]}
                            togglePlugin={togglePlugin}
                            settingsPage={settingsPagesDict[key]}
                        />
                    )) 
                    :
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }} >
                            <Typography
                                fontSize={20}
                            >
                                No plugins installed yet.
                            </Typography>
                        </div>
                }
            </div>
    );
};

export default Overview;


Overview.propTypes = {
    pluginDict: PropTypes.object.isRequired,                // Dictionary of all Plugins by uuid
    numInterceptors: PropTypes.number.isRequired,           // Total number of interceptors implemented
    pluginsEnabledDict: PropTypes.object.isRequired,        // Dictionary of what plugins are enabled
    togglePlugin: PropTypes.func.isRequired,                // Function to toggle a plugin
    interceptorUuidOrder: PropTypes.array.isRequired,       // Array for ordering interceptor plugins by uuid
    setInterceptOrder: PropTypes.func.isRequired,           // Change interceptor plugin order
};