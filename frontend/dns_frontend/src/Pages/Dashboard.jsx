import { Button } from "@mui/material";
import React, { useState } from "react";
import MainBox from "../Components/MainBox";
import StatBox from "../Components/DashboardComponents/StatBox";
import PieChart from "../Components/DashboardComponents/PieChart";
import LineChart from "../Components/DashboardComponents/LineChart";
import VerticalBarChart from "../Components/DashboardComponents/VerticalBarChart";

// To be removed later
import {
  mockDataFruits,
  mockBarData,
  mockLineData,
  mockDataTeam,
} from "../Tmp/TempData";


const Dashboard = () => {
  const getHeadings = () => {
    return Object.keys(mockDataTeam[0]);
  };

  const [editMode, setEditMode] = useState(false);

  return (
    <MainBox title={
      [
        <div style={{ display: 'flex', flexDirection: 'row'}} >
          Dashboard
          <Button variant="contained" sx={{ marginLeft: 'auto', marginY: 'auto' }} editMode={editMode} onClick={() => { setEditMode(!editMode) }} > { editMode ? "Done" : "Edit" } </Button>
        </div>
      ]
      } 
      divider
    >
      {/* Grid */}
      <div style={{ paddingBottom: 30 }} >
        <div style={{display: 'flex', flexDirection: 'row' }} >
          <div style={{ width: '25%', height: 200 }} >
            <PieChart data={mockDataFruits} />
          </div>
          <div style={{ width: '25%', height: 200 }} >
            <PieChart data={mockDataFruits} />
          </div>
          <div style={{ width: '25%', height: 200 }} >
            <PieChart data={mockDataFruits} />
          </div>
          <div style={{ width: '25%', height: 200 }} >
            <PieChart data={mockDataFruits} />
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row' }} >
          <div style={{ width: '60%', height: 300 }} >
            <LineChart data={mockLineData} />
          </div>
          <div style={{ width: '40%', height: 300 }} >
            <VerticalBarChart data={mockBarData} />
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 1}} >
          <div style={{ width: '40%', height: 300 }} >
              <StatBox title={"Requests Blocked"} subtitle={"123,432"} />
          </div>
        </div>
      </div>
    </MainBox>
  );
};

export default Dashboard;
