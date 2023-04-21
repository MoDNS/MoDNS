import { Button } from "@mui/material";
import React, { useState } from "react";
import MainBox from "../Components/MainBox";
import { ParseDashboardPage } from "../scripts/ParseDashboardPage";
import { getServerConfig, setServerConfig } from "../API/getsetAPI";
import { getDashboardLayout, setDashboardLayout } from "../scripts/getsetLocalStorage";


const Dashboard = () => {
  const [editMode, setEditMode] = useState(false);

  const useGlobalDashboard = getServerConfig('use_global_dashboard');;

    let json;
    if (useGlobalDashboard) {
      json = getServerConfig("dashboard");
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
                  setServerConfig('dashboard', dashboardJson);
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
      >
        <ParseDashboardPage editMode={editMode} dashboardJson={dashboardJson} setDashboardJson={setDashboardJson} />
      </MainBox>

      

    </>
  );
};

export default Dashboard;
