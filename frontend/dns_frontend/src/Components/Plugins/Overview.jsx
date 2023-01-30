import React from 'react';
import PluginOverview from '../PluginOverview';

const Overview = ({ modList }) => {


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
                modList.map((mod, index) => {
                    return (
                        <PluginOverview key={index} uuid={mod.uuid} name={mod.friendlyName} description={mod.description} home={mod.home} modules={mod.modules} interceptPosition={mod.interceptPosition} enabled={mod.enabled} />
                    )
                })
            }
        </div>
    );
};

export default Overview;
