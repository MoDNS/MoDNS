import { Button, Icon, InputAdornment, Switch, TextField, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import ErrorIcon from '@mui/icons-material/Error';

import { getServerConfig, setServerConfig } from '../../API/getsetAPI';

const ServerSettings = () => {

    const checkStaticIP = (ip) => {
        return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(ip)
    }

    const [webAddress, setWebAddress] = useState('modns');
    const [staticIP, setStaticIP] = useState( getServerConfig('static_ip') );
    const [errorStaticIP, setErrorStaticIP] = useState( staticIP ? !checkStaticIP(staticIP) : true );
    const [useStaticIP, setUseStaticIP] = useState( getServerConfig('use_static_ip') );

    const inputStaticIP = (ip) => {
        setStaticIP(ip);
        if (!checkStaticIP(ip)) {
            setErrorStaticIP(true);
        }
        else setErrorStaticIP(false);
    }

    ///// called when apply changes is pressed /////
    const handleSetWebAddress = () => {
        if (webAddress) {
            setServerConfig('web_address', webAddress + ".local");
        } else {
            alert("No Web Address Provided");
        }
    }
    const handleStaticIPSwitch = () => {
        setServerConfig('use_static_ip', useStaticIP);
    }
    const handleSetStaticIP = () => {
        if (checkStaticIP(staticIP)) {
            setServerConfig('static_ip', staticIP);
        } else {
            alert("Static IP format not correct");
        }
    }


    const applyChanges = () => {
        handleSetWebAddress();
        handleStaticIPSwitch();
        if (useStaticIP) {
            handleSetStaticIP();
        }

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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1, width: '100%', paddingLeft: 50, paddingRight: 50, }} >
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                    <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignItems: 'center', }}>
                        <Typography
                            sx={{ 
                                fontSize: 25,
                                marginRight: 'auto',
                            }}
                            >
                            Web Address:
                        </Typography>

                        <TextField
                            defaultValue={webAddress}
                            placeholder={'modns'}
                            inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                            onFocus={ (e) => e.target.select() }
                            onInput={ e => setWebAddress(e.target.value) }
                            sx={{ marginLeft: 'auto', width: 195, }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment sx={{ marginLeft: 0, marginBottom: 0.5,}} position='end'>
                                        <Typography >
                                            .local
                                        </Typography>
                                    </InputAdornment>
                                )
                            }}
                        />
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
                            checked={useStaticIP}
                            onChange={ () => setUseStaticIP( !useStaticIP )}
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
                            defaultValue={staticIP}
                            disabled={!useStaticIP}
                            inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                            placeholder={ useStaticIP ? 'xxx.xxx.xxx.xxx' : null }
                            onInput={ e => inputStaticIP(e.target.value) }
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