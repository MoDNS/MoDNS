import { Button, InputAdornment, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import InputField from '../InputField';

const ServerSettings = () => {

    const [webAddress, setWebAddress] = useState('modns');

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1, }} >
                <Typography
                    sx={{ 
                        fontSize: 25,
                        marginRight: 3,
                     }}
                >
                    Web Address:
                </Typography>

                <InputField
                    defaultValue={'modns'}
                    placeholder={webAddress}
                    inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                    onInput={ e => setWebAddress(e.target.value) }
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

            <Button
                variant={'contained'}
                sx={{  position: 'sticky', bottom: 0, }}
            >
                Apply Changes
            </Button>            

        </>
    );
};

export default ServerSettings;