import React from 'react';
import ModOverview from './ModOverview';

const Overview = () => {

    return (
        <div 
            style={{
                margin: 10,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <ModOverview />
            <ModOverview />
        </div>
    );
};

export default Overview;