import { Typography, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import React, { useState } from "react";

import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { getAuthentication, setNewPassword } from "../../API/getsetAPI";

const ChangePassword = () => {

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  const handleApplyChanges = () => {
    let success = false;
    if (!getAuthentication(oldPass)) {
      alert("Old Password Incorrect");
      return
    }
    if (confPass === newPass) {
      success = setNewPassword(oldPass, newPass);

      if (success) {
        alert("Password Changed");
      } else {
        alert("Error")
      }
    } else {
      alert ("New Passwords do not match");
    }
  }

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
          <TextField 
            placeholder="Enter Password" 
            label="Old Password" 
            autoComplete="current-password"
            type={ showOldPass ? 'text' : 'password'}
            onInput={ e=> setOldPass(e.target.value) }
            InputProps={{
              endAdornment: (
                  <InputAdornment position='end'>
                      <IconButton
                          onClick={ () => setShowOldPass(!showOldPass) }
                          onMouseDown= { (e) => { e.preventDefault() } }
                      >
                          {showOldPass ? <VisibilityOff /> : <Visibility /> }
                      </IconButton>
                  </InputAdornment>
              )
          }}
          />
          <TextField
            placeholder="Enter New Password"
            label="New Password"
            sx={{ marginTop: 5 }}
            type={ showNewPass ? 'text' : 'password'}
            onInput={ e=> setNewPass(e.target.value) }
            InputProps={{
              endAdornment: (
                  <InputAdornment position='end'>
                      <IconButton
                          onClick={ () => setShowNewPass(!showNewPass) }
                          onMouseDown= { (e) => { e.preventDefault() } }
                      >
                          {showNewPass ? <VisibilityOff /> : <Visibility /> }
                      </IconButton>
                  </InputAdornment>
              )
          }}
          />
          <TextField 
            placeholder="Confirm New Password" 
            label="Confirm Password" 
            type={ showConfPass ? 'text' : 'password'}
            onInput={ e=> setConfPass(e.target.value) }
            InputProps={{
              endAdornment: (
                  <InputAdornment position='end'>
                      <IconButton
                          onClick={ () => setShowConfPass(!showConfPass) }
                          onMouseDown= { (e) => { e.preventDefault() } }
                      >
                          {showConfPass ? <VisibilityOff /> : <Visibility /> }
                      </IconButton>
                  </InputAdornment>
              )
          }}
          />
        </div>
      </div>
      <Button
        variant={"contained"}
        fullWidth
        onClick={ () => handleApplyChanges() }
        sx={{ position: "sticky", bottom: 0, marginTop: "2rem" }}
      >
        Apply Changes
      </Button>
    </>
  );
};

export default ChangePassword;
