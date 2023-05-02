import React from 'react';
import { getPluginConfig, setServerConfig } from '../../API/getsetAPI';
import { useState, useEffect } from 'react';
import { Button, Checkbox, FormControlLabel, IconButton, InputAdornment, List, ListItem, MenuItem, Select, TextField, Tooltip, Typography, useTheme, Icon } from '@mui/material';
import { LOG_FILTER_KEY, PLUGIN_PATH_KEY, DB_TYPE_KEY, POSTGRES_IP_KEY, POSTGRES_PASS_KEY, POSTGRES_PORT_KEY, POSTGRES_USER_KEY, SQLITE_PATH_KEY } from '../../Constants';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SettingBox from './SettingBox';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import { IPInputValidation } from '../../scripts/scripts';


const AdvancedSettings = () => {

    const theme = useTheme();

    const loggingOptions = ["error", "warn", "info", "debug", "trace"];

    const parseLogFilter = (content) => {
        try {
            let list = content.value.split("=");
            list = list[1].split(",");
            return [...list]
        } catch (error) {
            return ["", ""];
        }
    }
    
    const [oldSettings, setOldSettings] = useState({});
    const [currentSettings, setCurrentSettings] = useState({});


    const [addPath, setAddPath] = useState("");
    const [textLogFilter, setTextLogFilter] = useState("");
    const [selectLogFilter, setSelectLogFilter] = useState(["", ""]);
    const [useCustLogFilt, setUseCustLogFilt] = useState();
    const [showPass, setShowPass] = useState(false);
    const [errorPostgresIP, setErrorPostgresIP] = useState( false );
    
    useEffect(() => {
        getPluginConfig([LOG_FILTER_KEY, PLUGIN_PATH_KEY, DB_TYPE_KEY, SQLITE_PATH_KEY, POSTGRES_IP_KEY, POSTGRES_PORT_KEY, POSTGRES_USER_KEY, POSTGRES_PASS_KEY]).then(res => {
            setOldSettings((res && {...res}) || {});
            setCurrentSettings((res && {...res}) || {});

            setSelectLogFilter(parseLogFilter((res && res[LOG_FILTER_KEY] && res[LOG_FILTER_KEY].value) || ""));
            setTextLogFilter((res && res[LOG_FILTER_KEY] && res[LOG_FILTER_KEY].value) || "");
            setUseCustLogFilt(!(loggingOptions.includes(selectLogFilter[0] || "") && loggingOptions.includes(selectLogFilter[1] || "")));
            setErrorPostgresIP(IPInputValidation((res && res[POSTGRES_IP_KEY] && res[POSTGRES_IP_KEY].value) || ""));

        })
        
    }, []);
    

    const logFilterCheck = (useCust) => {
        if (useCust) {
            handleChange(LOG_FILTER_KEY, {
                overridden:  (currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || false,
                value: textLogFilter,
            });
        } else {
            handleChange(LOG_FILTER_KEY, {
                overridden:  (currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || false,
                value: `modns=${selectLogFilter[0]},${selectLogFilter[1]}`
            });
        }
    }

    const handleChange = (key, value) => {
        let x = currentSettings;
        x[key] = value;
        setCurrentSettings({...x});
    }


    const applyChanges = () => {
        let newSett = {}
        Object.keys(currentSettings || {}).forEach(key => {
            if (key !== PLUGIN_PATH_KEY) {
                if ((oldSettings[key] && oldSettings[key].value) !== currentSettings[key]) {
                    newSett[key] = currentSettings[key].value;
                }
            } else {
                let x = []
                currentSettings[key].forEach(element => {
                    x.push(element.value);
                });
                newSett[key] = x;
            }
        });
        setServerConfig(newSett);
    }


    const makePluginPathList = () => {
        return (currentSettings[PLUGIN_PATH_KEY] || []).map((path, index) => {
            return <ListItem
                sx={{ paddingLeft: 1 }}
                secondaryAction={
                    <IconButton edge="end"
                        disabled={path && path.overridden}
                        onClick={() => {
                            let x = [...currentSettings[PLUGIN_PATH_KEY]];
                            x.splice(index, 1);
                            handleChange(PLUGIN_PATH_KEY, [...x]);
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                }
                disablePadding
                key={index}
            >
                {path.value}
                </ListItem>
        })
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row' }} >
                <Typography
                    sx={{
                        fontSize: 35,
                    }}
                >
                    Advanced Settings
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
                    <SettingBox title={"Advanced"} >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Tooltip title={"Where the server searches for plugins."} >
                                <Typography
                                    sx={{
                                        fontSize: 25,
                                        marginRight: 'auto',
                                        marginBottom: 'auto'
                                    }}
                                >
                                    Plugin Paths:
                                </Typography>
                            </Tooltip>
                                
                            <TextField
                                value={addPath && addPath.value}
                                onChange={ (e) => setAddPath(e.target.value) }
                                onKeyPress={(e) => {
                                    if (e.key !== "Enter") {
                                        return;                                        
                                    }
                                    if (addPath.trim() === "") {
                                        return;
                                    }
                                    let x = (currentSettings[PLUGIN_PATH_KEY] && [...currentSettings[PLUGIN_PATH_KEY]]) || [];
                                    x.push({
                                        overridden: false,
                                        value: addPath,
                                    });
                                    handleChange(PLUGIN_PATH_KEY, [...x]);
                                    setAddPath("");
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end' >
                                            { 
                                                <IconButton 
                                                    sx={{ marginRight: 0.5 }}
                                                    onClick={() => {
                                                        if (addPath.trim() === "") {
                                                            return;
                                                        }
                                                        let x = (currentSettings[PLUGIN_PATH_KEY] && [...currentSettings[PLUGIN_PATH_KEY]]) || [];
                                                        x.push({
                                                            overridden: false,
                                                            value: addPath,
                                                        });
                                                        handleChange(PLUGIN_PATH_KEY, [...x]);
                                                        setAddPath("");
                                                    }}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            }
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <List
                                sx={{ backgroundColor: theme.palette.primary.dark, maxHeight: 150, overflowY: 'auto', width: '100%', }}
                                dense={true}
                            >
                                { makePluginPathList() }
                            </List>
                            
                        </div>

                        <div style={{ direction: 'column', alignItems: 'center', marginTop: 35, }}>
                            <div style={{ display: 'flex', width: '100%' }}>
                                <Typography
                                    sx={{
                                        fontSize: 25,
                                        marginRight: 'auto',
                                        marginBottom: 'auto'
                                    }}
                                >
                                    Log Filter:
                                </Typography>

                                <FormControlLabel
                                    label={<Typography > use custom </Typography>}
                                    labelPlacement={'start'}
                                    control={
                                        <Checkbox 
                                            sx={{ marginLeft: 1, marginRight: 3 }}
                                            checked={useCustLogFilt}
                                            onChange={() => {
                                                let x = !useCustLogFilt
                                                setUseCustLogFilt(x)
                                                logFilterCheck(x)
                                            }}
                                        />
                                    } 
                                />
                                <TextField
                                    value={textLogFilter}
                                    disabled={(currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || !useCustLogFilt}
                                    onChange={(e) => {
                                        setTextLogFilter(e.target.value);
                                        logFilterCheck(useCustLogFilt)
                                    }}
                                />
                            </div>     
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                <Typography
                                    fontSize={20}
                                    marginTop={'auto'}
                                >
                                    modns=
                                </Typography>
                                <Select
                                    disabled={(currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || useCustLogFilt}
                                    value={selectLogFilter[0] || ""}
                                    sx={{ width: 100, marginTop: 'auto' }} 
                                    onChange={(e) => {
                                        let x = [...selectLogFilter];
                                        x[0] = e.target.value;
                                        setSelectLogFilter([...x]);
                                        logFilterCheck(useCustLogFilt)
                                    }}
                                >
                                    {
                                        loggingOptions.map((option, index) => (
                                            <MenuItem value={option} key={index}>
                                                {option.charAt(0).toUpperCase()}{option.substring(1)}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                <Typography
                                    marginTop={'auto'}
                                    fontSize={20}
                                >
                                    ,
                                </Typography>
                                <Select
                                    disabled={(currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || useCustLogFilt}
                                    sx={{ width: 100, marginTop: 'auto' }} 
                                    value={selectLogFilter[1] || ""}
                                    onChange={(e) => {
                                        let x = [...selectLogFilter];
                                        x[1] = e.target.value;
                                        setSelectLogFilter([...x]);
                                        logFilterCheck()
                                    }}
                                >
                                    {
                                        loggingOptions.map((option, index) => (
                                            <MenuItem value={option} key={index}>
                                                {option.charAt(0).toUpperCase()}{option.substring(1)}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                <TextField
                                    value={`modns=${selectLogFilter[0]},${selectLogFilter[1]}`}
                                    disabled={(currentSettings[LOG_FILTER_KEY] && currentSettings[LOG_FILTER_KEY].overridden) || useCustLogFilt}
                                    sx={{ marginTop: 'auto', marginBottom: 0 }}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </div>                   
                        </div>
                    </SettingBox>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                    <SettingBox title={"Database Settings"} >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Typography
                                sx={{ 
                                    fontSize: 25,
                                    marginRight: 'auto',
                                }}
                                >
                                Database Type:
                            </Typography>
                            <Select
                                disabled={currentSettings[DB_TYPE_KEY] && currentSettings[DB_TYPE_KEY].overridden}
                                value={(currentSettings[DB_TYPE_KEY] && currentSettings[DB_TYPE_KEY].value) || ""}
                                onChange={(e) => {
                                    let x = currentSettings[DB_TYPE_KEY] || {};
                                    x.value = e.target.value;
                                    handleChange(DB_TYPE_KEY, {...x});
                                }}
                                sx={{ width: 100, marginTop: 'auto' }} 
                            >
                                <MenuItem value={"Sqlite"} > SQLite </MenuItem>
                                <MenuItem value={"Postgres"} > Postgres </MenuItem>
                            </Select>
                        </div>
                        {
                            currentSettings[DB_TYPE_KEY] === "Sqlite" ? <>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 25,
                                            marginRight: 'auto',
                                            marginBottom: 'auto'
                                        }}
                                    >
                                        File Path:
                                    </Typography>
                                    <TextField
                                        disabled={currentSettings[SQLITE_PATH_KEY] && currentSettings[SQLITE_PATH_KEY].overridden}
                                        value={(currentSettings[SQLITE_PATH_KEY] && currentSettings[SQLITE_PATH_KEY].value) || ""}
                                        onChange={(e) => {
                                            let x = currentSettings[SQLITE_PATH_KEY] || {};
                                            x.value = e.target.value;
                                            handleChange(SQLITE_PATH_KEY, {...x});
                                        }}
                                    />
                                </div>
                                
                            </> : currentSettings[DB_TYPE_KEY] === "Postgres" && <>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 25,
                                            marginRight: 'auto',
                                            marginBottom: 'auto'
                                        }}
                                    >
                                        IP Address:
                                    </Typography>
                                    <TextField
                                        disabled={currentSettings[POSTGRES_IP_KEY] && currentSettings[POSTGRES_IP_KEY].overridden}
                                        value={(currentSettings[POSTGRES_IP_KEY] && currentSettings[POSTGRES_IP_KEY].value) || ""}
                                        onChange={(e) => {
                                            let ip = e.target.value;
                                            if (IPInputValidation(ip)) {
                                                setErrorPostgresIP(false);
                                            }
                                            else {
                                                setErrorPostgresIP(true);
                                            
                                            }
                                            let x = currentSettings[POSTGRES_IP_KEY] || {};
                                            x.value = ip;
                                            handleChange(POSTGRES_IP_KEY, {...x});
                                        }}
                                        inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position='start'>
                                                    { errorPostgresIP &&
                                                        <Icon>
                                                            <ErrorIcon />
                                                        </Icon>
                                                    }
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 25,
                                            marginRight: 'auto',
                                            marginBottom: 'auto'
                                        }}

                                    >
                                        Port:
                                    </Typography>
                                    <TextField
                                        disabled={currentSettings[POSTGRES_PORT_KEY] && currentSettings[POSTGRES_PORT_KEY].overridden}
                                        value={(currentSettings[POSTGRES_PORT_KEY] && currentSettings[POSTGRES_PORT_KEY].value) || ""}
                                        inputProps={{ maxLength: 5, style: { textAlign: 'right', paddingRight: 0, }}}
                                        onChange={(e) => {
                                            let x = currentSettings[POSTGRES_PORT_KEY] || {}
                                            let input = e.target.value;
                                            if(/^\d*$/.test(input)){
                                                x.value = input;
                                                handleChange(POSTGRES_PORT_KEY, {...x});
                                            }
                                        }}
                                    />
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 25,
                                            marginRight: 'auto',
                                            marginBottom: 'auto'
                                        }}

                                    >
                                        Postgres Username:
                                    </Typography>
                                    <TextField
                                        disabled={currentSettings[POSTGRES_USER_KEY] && currentSettings[POSTGRES_USER_KEY].overridden}
                                        value={(currentSettings[POSTGRES_USER_KEY] && currentSettings[POSTGRES_USER_KEY].value) || ""}
                                        onInput={ e => {
                                            let x = currentSettings[POSTGRES_USER_KEY] || {}
                                            x.value = e.target.value;
                                            handleChange(POSTGRES_USER_KEY, {...x});
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                                    <Typography
                                        sx={{
                                            fontSize: 25,
                                            marginRight: 'auto',
                                            marginBottom: 'auto'
                                        }}

                                    >
                                        Postgres Password:
                                    </Typography>
                                    <TextField
                                        disabled={currentSettings[POSTGRES_PASS_KEY] && currentSettings[POSTGRES_PASS_KEY].overridden}
                                        type={ showPass ? 'text' : 'password' }
                                        value={(currentSettings[POSTGRES_PASS_KEY] && currentSettings[POSTGRES_PASS_KEY].value) || ""}
                                        onInput={ e => {
                                            let x = currentSettings[POSTGRES_PASS_KEY]
                                            x.value = e.target.value;
                                            handleChange(POSTGRES_PASS_KEY, {...x});
                                        }}
                                        onFocus={e => {
                                            e.target.select();
                                        }}
                                        
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <IconButton
                                                        onClick={ () => setShowPass(!showPass) }
                                                        onMouseDown= { (e) => { e.preventDefault() } }
                                                    >
                                                        {showPass ? <VisibilityOff /> : <Visibility /> }
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </div>
                            </>
                        }
                    </SettingBox>
                </div>
            </div>

                       

        </>
    );
};

export default AdvancedSettings;