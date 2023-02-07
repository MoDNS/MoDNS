import React from 'react';
import PluginOverview from '../PluginOverview';

const Overview = ({ togglePlugin, pluginStates, pluginList, numInterceptors, pluginLists, setPluginLists, interceptorOrderDict }) => {


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
                            pluginLists={pluginLists}
                            setPluginLists={setPluginLists}
                        />
                    )
                })
            }
        </div>
    );
};

export default Overview;
