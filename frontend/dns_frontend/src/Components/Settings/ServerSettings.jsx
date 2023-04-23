import { Button, Checkbox, FormControlLabel, Icon, IconButton, InputAdornment, List, ListItem, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import { getServerConfig, setServerConfig } from '../../API/getsetAPI';
import { useTheme } from '@emotion/react';
import { IPInputValidation } from '../../scripts/scripts';

const ServerSettings = () => {
    const theme = useTheme();

    const loggingOptions = ["error", "warn", "info", "debug", "trace"];


    const parseLogFilter = () => {
        try {
            let list = logFilter.value.split("=");
            list = list[1].split(",");
            return [...list]
        } catch (error) {
            return ["", ""];
        }
    }


    const [useGlobDash, setUseGlobDash] = useState( getServerConfig('use_global_dashboard') );
    const [staticIP, setStaticIP] = useState( getServerConfig('static_ip') );
    const [useStaticIP, setUseStaticIP] = useState( getServerConfig('use_static_ip') );
    const [pluginPaths, setPluginPaths] = useState( getServerConfig('plugin_paths'));

    const [logFilter, setLogFilter] = useState( getServerConfig('log_filter') );
    const [selectLogFilter, setSelectLogFilter] = useState(parseLogFilter());


    const [errorStaticIP, setErrorStaticIP] = useState( staticIP.value ? !IPInputValidation(staticIP.value) : true );
    const [addPath, setAddPath] = useState("");
    const [useCustLogFilt, setUseCustLogFilt] = useState(!(loggingOptions.includes(selectLogFilter[0]) && loggingOptions.includes(selectLogFilter[1])));

    const inputStaticIP = (ip) => {
        setStaticIP(ip);
        console.log(ip);
        if (!IPInputValidation(ip.value)) {
            setErrorStaticIP(true);
        }
        else {
            setErrorStaticIP(false);
        }
    }


    ///// called when apply changes is pressed /////
    const handleSetUseGlobDash = () => {
        setServerConfig('use_global_dashboard', useGlobDash.value);
    }
    const handleStaticIPSwitch = () => {
        setServerConfig('use_static_ip', useStaticIP.value);
    }
    const handleSetStaticIP = () => {
        if (IPInputValidation(staticIP.value)) {
            setServerConfig('static_ip', staticIP.value);
        } else {
            alert("Static IP format not correct");
        }
    }
    const handleSetPluginPaths = () => {
        setServerConfig('plugin_paths', pluginPaths);
    }
    const handleSetLogFilter = () => {
        if (useCustLogFilt) {
            setServerConfig('log_filter', logFilter.value);
        } else {
            setServerConfig('log_filter', `modns=${selectLogFilter[0]},${selectLogFilter[1]}`)
        }
    }


    const applyChanges = () => {
        !useGlobDash.overridden && handleSetUseGlobDash();
        !useStaticIP.overridden && handleStaticIPSwitch();
        if (useStaticIP.value) {
            !staticIP.overridden && handleSetStaticIP();
        }
        handleSetPluginPaths();
        !logFilter.overridden && handleSetLogFilter();
    }


    const makePluginPathList = () => {
        return pluginPaths.map((path, index) => {
            return <ListItem
                sx={{ paddingLeft: 1 }}
                secondaryAction={
                    <IconButton edge="end"
                        disabled={path.overridden}
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
                            disabled={useGlobDash.overridden}
                            value={useGlobDash.value ? 'use_global_dashboard' : 'use_local_dashboard'}
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
                        <Typography
                            sx={{
                                fontSize: 25,
                                marginRight: 'auto',
                            }}
                        >
                            Use Static IP:
                        </Typography>
                        <Switch 
                            disabled={useStaticIP.overridden}
                            checked={useStaticIP.value}
                            onChange={ () => {
                                let x = {...useStaticIP};
                                x.value = !useStaticIP.value;
                                setUseStaticIP( {...x} )
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', opacity: !useStaticIP ? '50%' : '100%', }}>
                        <Typography
                            sx={{ 
                                fontSize: 25,
                                marginRight: 'auto',
                            }}
                            >
                            Static IP:
                        </Typography>

                        <TextField
                            onFocus={ (e) => e.target.select() }
                            defaultValue={staticIP.value}
                            disabled={!useStaticIP.value || staticIP.overridden}
                            inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                            placeholder={ useStaticIP ? 'xxx.xxx.xxx.xxx' : null }
                            onInput={ e => {
                                let x = {...staticIP}
                                x.value = e.target.value;
                                inputStaticIP({...x});
                            } }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        { errorStaticIP &&
                                            <Icon>
                                                <ErrorIcon />
                                            </Icon>
                                        }
                                    </InputAdornment>
                                )
                            }}
                        />
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
                            
                        <div style={{ display: 'flex', flexDirection: 'column' }} >
                            <TextField
                                value={addPath}
                                onChange={ (e) => setAddPath(e.target.value) }
                                onKeyPress={(e) => {
                                    if (e.key !== "Enter") {
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
                                }} //this adds enter to submit
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end' >
                                            { 
                                                <IconButton 
                                                sx={{ marginRight: 0.5 }}
                                                onClick={() => {
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
                            <List
                                sx={{ backgroundColor: theme.palette.primary.dark, maxHeight: 150, overflowY: 'scroll' }}
                                dense={true}
                            >
                                { makePluginPathList() }
                            </List>
                        </div>
                        
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
                                value={logFilter.value}
                                disabled={logFilter.overridden || !useCustLogFilt}
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
                                disabled={logFilter.overridden || useCustLogFilt}
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
                                disabled={logFilter.overridden || useCustLogFilt}
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
                                disabled={logFilter.overridden || useCustLogFilt}
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