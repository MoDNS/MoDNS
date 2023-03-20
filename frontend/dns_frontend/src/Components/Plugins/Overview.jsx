import React from 'react';
import { PropTypes } from 'prop-types';
import PluginOverview from '../PluginOverview';

const Overview = ({ pluginDict, numInterceptors, pluginsEnabledDict, togglePlugin, interceptorUuidOrder, setInterceptOrder }) => {

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
                pluginDict && Object.keys(pluginDict).map((key, index) => (
                    <PluginOverview 
                        key={index} 
                        // plugin info
                        uuid={key}
                        friendlyName={pluginDict[key].friendly_name} 
                        description={pluginDict[key].description} 
                        home={pluginDict[key].home} 
                        modules={pluginDict[key].modules} 
                        interceptPosition={ interceptorUuidOrder.includes(key) ? interceptorUuidOrder.indexOf(key) + 1 : null }
                        setInterceptOrder={setInterceptOrder}
                        numInterceptors={numInterceptors}
                        pluginState={pluginsEnabledDict[key]}
                        togglePlugin={togglePlugin}
                    />
                ))
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