import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useTheme } from '@mui/material';

import MainBox from '../Components/MainBox';
import Title from '../Components/Title';


const Settings = () => {
    const theme = useTheme();

    return (
        <MainBox>
            <Title divider>
                Settings
            </Title>
            <div style={{display:'flex', flexDirection:'row', flexGrow: 1, position: 'relative', top: 25,}}>
                <div 
                    style={{ 
                        flexGrow: 0.70,
                        position: 'relative',
                        top: 10,
                        paddingRight: 80,
                        paddingLeft: 25,
                    }}
                >
                    <div 
                        style={{
                            display: 'flex', 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            marginBottom: 30,
                        }} 
                    >
                        <Typography sx={{ fontSize: 25, }}>
                            Theme
                        </Typography>
                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                        >
                            Open
                        </Button>
                    </div>

                    <div 
                        style={{ 
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 30,
                        }} 
                    >
                        <Typography  sx={{ fontSize: 25 }}>
                            Sever
                        </Typography>
                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }} 
                        >
                            Open
                        </Button>
                    </div>

                    <div 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            marginBottom: 30,
                        }} 
                    >
                        <Typography  sx={{ fontSize: 25 }}>
                            Change Password
                        </Typography>
                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                        >
                            Open
                        </Button>
                    </div>

                </div>

                <Box 
                    sx={{
                        borderRadius: 8, 
                        padding: 3,
                        overflow: 'auto',
                        flexGrow: 1.3,
                        border: `4px solid ${theme.palette.background.default}`,
                    }}
                >
                    <Button>
                        b
                    </Button>
                </Box>
            </div>
        </MainBox>

    );
};

export default Settings;