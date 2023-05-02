import React, { useState, useEffect } from 'react';
import { getServerConfig, setServerConfig } from '../../API/getsetAPI';
import { Button, Typography, FormControlLabel, Switch, Tooltip, TextField } from '@mui/material';
import SettingBox from './SettingBox';
import ChangePassword from './ChangePassword';
import { ADMIN_PW_KEY, API_PORT_KEY, HTTPS_ENABLED_KEY, TLS_CERT_KEY, TLS_KEY_KEY } from '../../Constants';

const WebSecurity = () => {

    
    


    const [oldSettings, setOldSettings] = useState({});
    const [currentSettings, setCurrentSettings] = useState({});

    const handleChange = (key, value) => {
        let x = {...currentSettings};
        x[key] = value;
        setCurrentSettings({...x});
    }

    useEffect(() => {
        getServerConfig([HTTPS_ENABLED_KEY, TLS_CERT_KEY, TLS_KEY_KEY, API_PORT_KEY, ADMIN_PW_KEY]).then(res => {
            let x = res || {};
            x[ADMIN_PW_KEY] = {
                overridden: (res && res[ADMIN_PW_KEY] && res[ADMIN_PW_KEY].overridden) || false,
                value: "",
            }
            setOldSettings((x && {...x}) || {});
            setCurrentSettings((x && {...x}) || {});
        })        
    }, []);


    const [oldPass, setOldPass] = useState("");
    const [confPass, setConfPass] = useState("");

    const handleSetPassword = () => {
        let newPass = currentSettings[ADMIN_PW_KEY] && currentSettings[ADMIN_PW_KEY].value;
        if (newPass === "" || newPass === null || newPass === undefined) {
            alert("No Password Provided");
        } else if (confPass !== newPass) {
            alert ("New Passwords do not match");
        } else {
            return true;
        }
        return false;
    }

    const applyChanges = () => {
        let newSett = {}
        Object.keys(currentSettings || {}).forEach(key => {
            if ((oldSettings[key] && oldSettings[key].value) !== currentSettings[key]) {
                if (key === ADMIN_PW_KEY) {
                    if(handleSetPassword()) {
                        newSett[key] = currentSettings[key].value;
                    }
                } else {
                    newSett[key] = currentSettings[key].value;
                }
            }
        });
        console.log(newSett);
        setServerConfig(newSett);
    }



    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row' }} >
                <Typography
                    sx={{
                        fontSize: 35,
                    }}
                >
                    Web Security:
                </Typography>
                <Button
                    variant="contained"
                    sx={{ marginLeft: 'auto', marginTop: 'auto', marginBotom: 'auto' }}
                    onClick={() => {applyChanges()}}
                >
                    Apply Changes
                </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', paddingLeft: 50, paddingRight: 50, overflowY: 'auto', paddingTop: 30, paddingBottom: 30, justifyContent: 'space-between' }} >
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                    <SettingBox title={"HTTP Settings"}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                                sx={{ 
                                    fontSize: 25,
                                    marginRight: 'auto',
                                }}
                            >
                                Use HTTPS:
                            </Typography>
                            <FormControlLabel 
                                control={
                                    <Switch 
                                        checked={currentSettings[HTTPS_ENABLED_KEY] && currentSettings[HTTPS_ENABLED_KEY].value }
                                        onChange={(e) => {
                                            let x = currentSettings[HTTPS_ENABLED_KEY] || {};
                                            x.value = e.target.checked;
                                            handleChange(HTTPS_ENABLED_KEY, {...x});
                                        }}
                                    />
                                } 
                                sx={{ marginRight: 0, marginY: 'auto',marginLeft: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Tooltip title={"Path to the TLS Certificate"} >
                                <Typography>
                                    TLS Certificate Path:
                                </Typography>
                            </Tooltip>
                            <TextField
                                value={ currentSettings[TLS_CERT_KEY] && currentSettings[TLS_CERT_KEY].value }
                                onChange={(e) => {
                                    let x = currentSettings[TLS_CERT_KEY] || {}
                                    x.value = e.target.value;
                                    handleChange(TLS_CERT_KEY, {...x})
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Tooltip title={"Path to the TLS Key"} >
                                <Typography>
                                    TLS Key Path:
                                </Typography>
                            </Tooltip>
                            <TextField
                                value={ currentSettings[TLS_KEY_KEY] && currentSettings[TLS_KEY_KEY].value }
                                onChange={(e) => {
                                    let x = currentSettings[TLS_KEY_KEY] || {}
                                    x.value = e.target.value;
                                    handleChange(TLS_KEY_KEY, {...x})
                                }}
                            />
                        </div>
                    </SettingBox>
                    <SettingBox title={"Port"}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                        >
                            API Port:
                        </Typography>
                        <TextField
                            disabled={currentSettings[API_PORT_KEY] && currentSettings[API_PORT_KEY].overridden}
                            value={(currentSettings[API_PORT_KEY] && currentSettings[API_PORT_KEY].value) || ""}
                            inputProps={{ maxLength: 5, style: { textAlign: 'right', paddingRight: 0, }}}
                            onChange={(e) => {
                                let x = currentSettings[API_PORT_KEY] || {}
                                let input = e.target.value;
                                if(/^\d*$/.test(input)){
                                    x.value = input;
                                    handleChange(API_PORT_KEY, {...x});
                                }
                            }}
                        />
                    </div>
                    </SettingBox>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                    <SettingBox title={"Change Password"} noFullWidth >
                        <ChangePassword newPass={currentSettings[ADMIN_PW_KEY]} setNewPass={handleChange} oldPass={oldPass} setOldPass={setOldPass} confPass={confPass} setConfPass={setConfPass} />
                    </SettingBox>
                </div>
            </div>
        </>
    );
};

export default WebSecurity;