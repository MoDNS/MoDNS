import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import MainBox from "../Components/MainBox";
import { ParseDashboardPage } from "../scripts/ParseDashboardPage";
import { getServerConfig, setServerConfig, getDashboardLayoutAPI, setDashboardLayoutAPI,  } from "../API/getsetAPI";
import { getDashboardLayout, setDashboardLayout } from "../scripts/getsetLocalStorage";


const Dashboard = () => {
  const [editMode, setEditMode] = useState(false);
  const [useGlobalDashboard, setUseGlobDash] = useState(true);
  
  const [dashboardJson, setDashboardJson] = useState();


  useEffect(() => {
    getServerConfig('use_global_dashboard').then(useGlobDash => {
      setUseGlobDash(useGlobDash);
      if (useGlobDash) {
        getDashboardLayoutAPI().then(res => {
          setDashboardJson([...res]);
        })
      } else {
        setDashboardJson(getDashboardLayout());
      }
    })
  }, [] );

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
        { dashboardJson && <ParseDashboardPage editMode={editMode} dashboardJson={dashboardJson} setDashboardJson={setDashboardJson} />}
      </MainBox>

      

    </>
  );
};

export default Dashboard;
