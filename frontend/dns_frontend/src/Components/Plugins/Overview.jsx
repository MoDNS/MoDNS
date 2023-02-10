import React from 'react';
import { PropTypes } from 'prop-types';
import PluginOverview from '../PluginOverview';

const Overview = ({ togglePlugin, pluginStates, numInterceptors, pluginList, setPluginLists, interceptorOrderDict }) => {

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
                pluginList.map((plugin, index) => {
                    return (
                        <PluginOverview 
                            key={index} 
                            // plugin info
                            uuid={plugin.uuid} 
                            friendlyName={plugin.friendly_name} 
                            description={plugin.description} 
                            home={plugin.home} 
                            modules={plugin.modules} 
                            interceptPosition={ interceptorOrderDict[plugin.uuid] } 
                            pluginState={pluginStates[plugin.uuid]}         // plugin state dict decoded into state for this individual plugin
                            togglePlugin={togglePlugin}
                            numInterceptors={numInterceptors}
                            setPluginLists={setPluginLists}
                        />
                    )
                })
            }
        </div>
    );
};

export default Overview;


Overview.propTypes = {
    togglePlugin: PropTypes.func.isRequired,            // function to enable / disable a plugin
    pluginStates: PropTypes.object.isRequired,          // dictionary of enabled/disabled states of all plugins installed
    numInterceptors: PropTypes.number,                  // total number of interceptor plugins installed
    pluginList: PropTypes.array.isRequired,             // list of all plugins to display
    setPluginLists: PropTypes.func.isRequired,          // reorder plugins that allow drag n drop
    interceptorOrderDict: PropTypes.object.isRequired,  // dictionary of intercept orders based on uuid
};
