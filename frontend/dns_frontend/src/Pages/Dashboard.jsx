import { Button } from "@mui/material";
import React, { useState } from "react";
import MainBox from "../Components/MainBox";
import { ParseDashboardPage } from "../scripts/ParseDashboardPage";
import { getDashboardLayoutAPI, getServerConfig, setDashboardLayoutAPI } from "../API/getsetAPI";
import { getDashboardLayout, setDashboardLayout } from "../scripts/getsetLocalStorage";


const Dashboard = () => {
  const [editMode, setEditMode] = useState(false);

  const useGlobalDashboard = getServerConfig('use_global_dashboard').value;

    let json;
    if (useGlobalDashboard) {
      json = getDashboardLayoutAPI();
    } else {
      json = getDashboardLayout();
      console.log(json);
    }

    const [dashboardJson, setDashboardJson] = useState([...json]);

  return (
    <>
      <MainBox title={
        [
          <div key={1} style={{ display: 'flex', flexDirection: 'row'}} >
            Dashboard
            <Button variant="contained" sx={{ marginLeft: 'auto', marginY: 'auto' }} onClick={() => {
              if (editMode) {
                if (useGlobalDashboard) {
                  setDashboardLayoutAPI('dashboard', dashboardJson);
                } else {
                  console.log(dashboardJson);
                  setDashboardLayout(dashboardJson);
                }
              }
              setEditMode(!editMode);
              }} > { editMode ? "Save" : "Edit" } </Button>
          </div>
        ]
        } 
        divider
        allowScroll
      >
        <ParseDashboardPage editMode={editMode} dashboardJson={dashboardJson} setDashboardJson={setDashboardJson} />
      </MainBox>

      

    </>
  );
};

export default Dashboard;
