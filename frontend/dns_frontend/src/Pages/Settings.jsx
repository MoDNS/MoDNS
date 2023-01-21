import React from 'react';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material';
import { useState } from 'react';
import { PropTypes } from 'prop-types';

import MainBox from '../Components/MainBox';
import ServerSettings from '../Components/Settings/ServerSettings';
import ThemeSelector from '../Components/Settings/ThemeSelector';
import ChangePassword from '../Components/Settings/ChangePassword';



const Settings = ({ setTheme }) => {
    const theme = useTheme();
    
    const [box, setBox] = useState(0);

    const pages = {
        0: <ServerSettings />,
        1: <ThemeSelector setTheme={setTheme} />,
        2: <ChangePassword />,
    }

    return (
        <MainBox
            title={"Settings"}
            divider
        >
            <div style={{display:'flex', flexDirection:'row', flexGrow: 1, }}>
                <div 
                    style={{ 
                        width: '50%',
                        paddingRight: 80,
                        paddingLeft: 20,
                        paddingTop: 24,
                        paddingBottom: 24,
                        overflowY: 'auto',
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
                        <Typography  sx={{ fontSize: 25 }}>
                            Server
                        </Typography>

                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                            onClick={ () => { setBox(0) } }
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
                        <Typography sx={{ fontSize: 25, }}>
                            Theme
                        </Typography>

                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                            onClick={ () => { setBox(1) } }
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
                            onClick={ () => { setBox(2) } }
                        >
                            Open
                        </Button>
                    </div>                    

                </div>

                <Box 
                    sx={{
                        borderRadius: 8, 
                        padding: 3,
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'center',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        border: `4px solid ${theme.palette.primary.dark}`,
                    }}
                >
                    {
                        pages[box]
                    }
                </Box>
            </div>
        </MainBox>

    );
};

export default Settings;


Settings.propTypes = {
    setTheme: PropTypes.func.isRequired,
};

Settings.defaultProps = {
    setTheme: () => {},
};