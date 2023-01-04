import { Typography, Button } from '@mui/material';
import React from 'react';
import InputField from '../InputField';


const ChangePassword = () => {
    return (
        <>
            <Typography
                sx={{ 
                    fontSize: 25,
                }}
            >
                Change Password
            </Typography>
            <div class="InsideComponents" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1}}>
                <div style={{ display: 'flex', flexDirection: 'column'}}>
                    <InputField
                        placeholder='Enter Password'
                        label='Old Password'
                    />
                    <InputField
                        placeholder='Enter Password'
                        label='New Password'
                        sx={{ marginTop:5 }}
                    />
                    <InputField
                        placeholder='Enter Password'
                        label='Confirm Password'
                    />
                    <Button
                        variant={'contained'}
                        sx={{  position: 'sticky', bottom: 0, marginTop: "2rem"}}
                        // onClick={ () => handleApplyChanges() }
                    >
                        Apply Changes
                    </Button>
                </div>
            </div>  
        </>
    );
};

export default ChangePassword;