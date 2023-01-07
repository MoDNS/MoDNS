import { Button, InputAdornment, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import InputField from '../InputField';

const ServerSettings = () => {

    const [webAddress, setWebAddress] = useState('modns');

    const [staticIP, setStaticIP] = useState('xxx.xxx.xxx.xxx');

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

                        <InputField
                            defaultValue={'modns'}
                            placeholder={webAddress}
                            inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                            onInput={ e => setWebAddress(e.target.value) }
                            sx={{ marginLeft: 'auto', width: 195, }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment sx={{ color: 'text.primary', marginLeft: 0,}} position='end'>
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

                        <InputField
                            defaultValue={''}
                            placeholder={staticIP}
                            onInput={ e => setStaticIP(e.target.value) }
                        />
                    </div>
                </div>
            </div>

            <Button
                fullWidth
                variant={'contained'}
                sx={{  position: 'sticky', bottom: 0, }}
            >
                Apply Changes
            </Button>            

        </>
    );
};

export default ServerSettings;