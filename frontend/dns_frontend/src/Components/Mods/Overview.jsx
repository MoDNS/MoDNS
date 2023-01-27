import React from 'react';
import ModOverview from './ModOverview';

const Overview = ({modList}) => {


    return (
        <div 
            style={{
                margin: 10,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {
                modList.map((mod, index) => {
                    return (
                        <ModOverview key={index} uuid={mod.uuid} name={mod.friendlyName} description={mod.description} home={mod.home} implementations={mod.implementations} interceptPosition={mod.interceptPosition} enabled={mod.enabled} />
                    )
                })
            }
        </div>
    );
};

export default Overview;

Overview.defaultProps = {
    
};