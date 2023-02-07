import { Button, InputAdornment, TextField, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';

import { getServerConfig, setServerConfig } from '../../API/getsetAPI';

const ServerSettings = () => {

    const [webAddress, setWebAddress] = useState('modns');
    const [staticIP, setStaticIP] = useState( getServerConfig() );

    
    const handleSetStaticIP = () => {
        if (/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(staticIP)) {
            setStaticIP(staticIP);
            setServerConfig(staticIP);
        } else {
            alert("Static IP format not correct");
        }
    }


    const applyChanges = () => {
        handleSetStaticIP();
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
                                    <InputAdornment sx={{ marginLeft: 0,}} position='end'>
                                        <Typography >
                                            .local
                                        </Typography>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
                            inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                            placeholder={ 'xxx.xxx.xxx.xxx' }
                            onInput={ e => setStaticIP(e.target.value) }
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