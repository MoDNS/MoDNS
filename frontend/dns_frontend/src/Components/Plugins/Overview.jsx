import React from 'react';
import PluginOverview from '../PluginOverview';

const Overview = ({ togglePlugin, pluginStates, pluginList }) => {


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
                            friendlyName={plugin.friendlyName} 
                            description={plugin.description} 
                            home={plugin.home} 
                            modules={plugin.modules} 
                            interceptPosition={plugin.interceptPosition} 

                            pluginState={pluginStates[plugin.uuid]}         // plugin state dict decoded into state for this individual plugin
                            togglePlugin={togglePlugin}                     // toggle plugin function passed down
                        />
                    )
                })
            }
        </div>
    );
};

export default Overview;
