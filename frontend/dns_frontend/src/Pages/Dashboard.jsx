import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';

import MainBox from "../Components/MainBox";
import { ParseDashboardPage } from "../scripts/ParseDashboardPage";
import { getDashboardLayoutAPI, getServerConfig, setDashboardLayoutAPI } from "../API/getsetAPI";
import { getDashboardLayout, setDashboardLayout } from "../scripts/getsetLocalStorage";
import { USE_GLOBAL_DASH_KEY } from "../Constants";


const Dashboard = () => {
  const [editMode, setEditMode] = useState(false);
  const [useGlobalDashboard, setUseGlobDash] = useState(false);
  
  const [dashboardJson, setDashboardJson] = useState();

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    getServerConfig(USE_GLOBAL_DASH_KEY).then(useGlobDash => {
      setUseGlobDash(useGlobDash[USE_GLOBAL_DASH_KEY]);
      if (useGlobDash[USE_GLOBAL_DASH_KEY].value) {
        getDashboardLayoutAPI().then(res => {
          let x = (res && res["dashboard_layout"].data) || [];
          setDashboardJson([...x]);
          setLoading(false);
        })
      } else {
        setDashboardJson(getDashboardLayout());
        setLoading(false);
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
                if (useGlobalDashboard.value) {
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
        allowScroll
      >
        { loading ? <div style={{ width: '100%', height: '100%', display: 'flex' }} >
                        <CircularProgress color="inherit" sx={{ margin: 'auto' }} />
                        </div> :
          dashboardJson && <ParseDashboardPage editMode={editMode} dashboardJson={dashboardJson} setDashboardJson={setDashboardJson} />
        }
      </MainBox>

      

    </>
  );
};

export default Dashboard;
