import { Button, Checkbox, FormControlLabel, Icon, IconButton, InputAdornment, List, ListItem, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { getServerConfig, setServerConfig } from '../../API/getsetAPI';
import { useTheme } from '@emotion/react';
import { LOG_FILTER_KEY, PLUGIN_PATH_KEY, USE_GLOBAL_DASH_KEY } from '../../Constants';

const ServerSettings = () => {
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
    

    const [useGlobDash, setUseGlobDash] = useState({});
    const [pluginPaths, setPluginPaths] = useState([]);

    const [logFilter, setLogFilter] = useState({});
    const [selectLogFilter, setSelectLogFilter] = useState(["", ""]);
    
    useEffect(() => {
        getServerConfig(USE_GLOBAL_DASH_KEY).then(res => {
            setUseGlobDash(res);
        })
        getServerConfig(PLUGIN_PATH_KEY).then(res => {
            setPluginPaths(res || []);
        })
        getServerConfig(LOG_FILTER_KEY).then(res => {
            setLogFilter(res);
            setSelectLogFilter(parseLogFilter(res));
        })

    }, [])
    
    
    // const [errorStaticIP, setErrorStaticIP] = useState( staticIP && staticIP.value ? !IPInputValidation(staticIP.value) : true );
    const [addPath, setAddPath] = useState("");
    const [useCustLogFilt, setUseCustLogFilt] = useState(!(loggingOptions.includes(selectLogFilter[0] || "") && loggingOptions.includes(selectLogFilter[1] || "")));


    ///// called when apply changes is pressed /////
    const handleSetUseGlobDash = () => {
        if (useGlobDash.value !== undefined && useGlobDash.value !== null) {
            setServerConfig(USE_GLOBAL_DASH_KEY, useGlobDash.value);
        }
    }

    const handleSetPluginPaths = () => {
        setServerConfig(PLUGIN_PATH_KEY, pluginPaths.map(theJson => {
            return theJson.value;
        }));
    }
    const handleSetLogFilter = () => {
        if (useCustLogFilt) {
            setServerConfig(LOG_FILTER_KEY, logFilter.value);
        } else {
            setServerConfig(LOG_FILTER_KEY, `modns=${selectLogFilter[0] || ""},${selectLogFilter[1] || ""}`)
        }
    }


    const applyChanges = () => {
        !(useGlobDash && useGlobDash.overridden) && handleSetUseGlobDash();
        handleSetPluginPaths();
        !(logFilter && logFilter.overridden) && handleSetLogFilter();
    }


    const makePluginPathList = () => {
        return pluginPaths.map((path, index) => {
            return <ListItem
                sx={{ paddingLeft: 1 }}
                secondaryAction={
                    <IconButton edge="end"
                        disabled={path && path.overridden}
                        onClick={() => {
                            let x = [...pluginPaths];
                            x.splice(index, 1);
                            setPluginPaths([...x]);
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
            <Typography
                sx={{
                    fontSize: 35,
                }}
            >
                Server Settings
            </Typography>
            <div style={{ direction: 'row', alignItems: 'center', height: '100%', width: '100%', paddingLeft: 50, paddingRight: 50, overflowY: 'auto', paddingTop: 30, paddingBottom: 30, }} >
                <div style={{ direction: 'column'}}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Tooltip title={"Dashboard shared accross all devices or different for every device"} >
                            <Typography
                                sx={{ 
                                    fontSize: 25,
                                    marginRight: 'auto',
                                }}
                                >
                                Dashboard Source
                            </Typography>
                        </Tooltip>

                        <Select
                            disabled={useGlobDash && useGlobDash.overridden}
                            value={useGlobDash && useGlobDash.value ? 'use_global_dashboard' : 'use_local_dashboard'}
                            onChange={(e) => {
                                let x = {...useGlobDash}
                                x.value = e.target.value === "use_global_dashboard" ? true : false;
                                setUseGlobDash({...x});
                            }}
                        >
                            <MenuItem value={"use_global_dashboard"} > Global Dashboard </MenuItem>
                            <MenuItem value={"use_local_dashboard"} > Local Dashboard </MenuItem>
                        </Select>
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35, }}>
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
                            value={addPath}
                            onChange={ (e) => setAddPath(e.target.value) }
                            onKeyPress={(e) => {
                                if (e.key !== "Enter") {
                                    return;                                        
                                }
                                if (addPath.trim() === "") {
                                    return;
                                }
                                let x = [...pluginPaths];
                                x.push(
                                    {
                                        "overridden": false,
                                        "value": addPath
                                    }
                                );
                                setPluginPaths([...x]);
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
                                                    let x = [...pluginPaths];
                                                    x.push(
                                                        {
                                                            "overridden": false,
                                                            "value": addPath
                                                        }
                                                    );
                                                    setPluginPaths([...x]);
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
                                        onChange={() => setUseCustLogFilt(!useCustLogFilt)}
                                    />
                                } 
                            />
                            <TextField
                                value={(logFilter && logFilter.value) || ""}
                                disabled={(logFilter && logFilter.overridden) || !useCustLogFilt}
                                onChange={(e) => {
                                    let x = logFilter;
                                    x.value = e.target.value;
                                    setLogFilter({...x});
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
                                disabled={(logFilter && logFilter.overridden) || useCustLogFilt}
                                value={selectLogFilter[0] || ""}
                                sx={{ width: 100, marginTop: 'auto' }} 
                                onChange={(e) => {
                                    let x = [...selectLogFilter];
                                    x[0] = e.target.value;
                                    setSelectLogFilter([...x]);
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
                                disabled={(logFilter && logFilter.overridden) || useCustLogFilt}
                                sx={{ width: 100, marginTop: 'auto' }} 
                                value={selectLogFilter[1] || ""}
                                onChange={(e) => {
                                    let x = [...selectLogFilter];
                                    x[1] = e.target.value;
                                    setSelectLogFilter([...x]);
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
                                disabled={(logFilter && logFilter.overridden) || useCustLogFilt}
                                sx={{ marginTop: 'auto', marginBottom: 0 }}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </div>                   
                    </div>
                </div>
            </div>

            <Button
                fullWidth
                variant={'contained'}
                sx={{  position: 'sticky', bottom: 0, }}
                onClick={ () => applyChanges() }
            >
                Apply Changes
            </Button>            

        </>
    );
};

export default ServerSettings;