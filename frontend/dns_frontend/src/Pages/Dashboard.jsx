import React from 'react';
import {
    Chart,
    PieSeries,
    BarSeries,
    Title,
    ArgumentAxis,
    ValueAxis,
  } from '@devexpress/dx-react-chart-material-ui';
import MainBox from '../Components/MainBox';
import { render } from 'vue';
const data = [
    { country: 'Russia', area: 12 },
    { country: 'Canada', area: 7 },
    { country: 'USA', area: 7 },
    { country: 'China', area: 7 },
    { country: 'Brazil', area: 6 },
    { country: 'Australia', area: 5 },
    { country: 'India', area: 2 },
    { country: 'Others', area: 55 },
  ];

const Dashboard = () => {
    const dat = data;
    return (
        <MainBox
            title={"Dashboard"}
            divider
        >
            <Chart
                    data={dat}
                    sx={{
                        width: 500
                    }}
                >
                    <PieSeries
                        valueField="area"
                        argumentField="country"
                    />
                    <Title
                        text="Area of Countries"
                    />
                </Chart>
        </MainBox>
    );
};

export default Dashboard;