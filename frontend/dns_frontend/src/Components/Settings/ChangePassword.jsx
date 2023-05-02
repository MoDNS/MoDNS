import { Typography, Button, TextField, InputAdornment, IconButton } from "@mui/material";
import React, { useState } from "react";

import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { ADMIN_PW_KEY } from "../../Constants";

const ChangePassword = ({ oldPass, setOldPass, newPass, setNewPass, confPass, setConfPass }) => {

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
        <TextField 
          placeholder="Enter Password" 
          value={oldPass}
          label="Old Password" 
          autoComplete="current-password"
          type={ showOldPass ? 'text' : 'password'}
          onInput={ e => setOldPass(e.target.value) }
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
            value={(newPass && newPass.value) || ""}
            label="New Password"
            sx={{ marginTop: 5 }}
            type={ showNewPass ? 'text' : 'password'}
            onInput={ e => {
                let x = newPass || {};
                x.value = e.target.value;
                setNewPass(ADMIN_PW_KEY, {...x});
                }}
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
          value={confPass}
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
  );
};

export default ChangePassword;
