import { Typography, Button } from "@mui/material";
import React from "react";
import InputField from "../InputField";

const ChangePassword = () => {
  return (
    <>
      <Typography
        sx={{
          fontSize: 35,
        }}
      >
        Change Password
      </Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexGrow: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <InputField 
            placeholder="Enter Password" 
            label="Old Password" 
          />
          <InputField
            placeholder="Enter New Password"
            label="New Password"
            sx={{ marginTop: 5 }}
          />
          <InputField 
            placeholder="Confirm New Password" 
            label="Confirm Password" 
          />
        </div>
      </div>
      <Button
        variant={"contained"}
        fullWidth
        sx={{ position: "sticky", bottom: 0, marginTop: "2rem" }}
      >
        Apply Changes
      </Button>
    </>
  );
};

export default ChangePassword;
