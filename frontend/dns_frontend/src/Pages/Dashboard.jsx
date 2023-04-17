import { Button } from "@mui/material";
import React, { useState } from "react";
import MainBox from "../Components/MainBox";

const Dashboard = () => {
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
    </MainBox>
  );
};

export default Dashboard;
