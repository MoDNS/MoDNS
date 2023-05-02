import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useState } from 'react';
import { PropTypes } from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import MainBox from '../Components/MainBox';

import GeneralSettings from '../Components/Settings/GeneralSettings';
import AdvancedSettings from '../Components/Settings/AdvancedSettings';
import WebSecurity from '../Components/Settings/WebSecurity';



const Settings = ({ setTheme }) => {
    const theme = useTheme();
    
    const [box, setBox] = useState(0);

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflowX: 'hidden',
                    }}
                >
                    {children}
                </div>
            )}
          </div>
        );
      }

    function a11yProps(index) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }


    return (
        <MainBox
            title={
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    Settings
                    <div
                        style={{
                            marginLeft: 'auto',
                            marginTop: 'auto',
                            backgroundColor: theme.palette.primary.dark,
                            border: `2px solid ${theme.palette.primary.dark}`,
                        }}
                    >
                        <Tabs 
                            value={box} 
                            onChange={(e, newValue) => setBox(newValue)} 
                            TabIndicatorProps={{
                                style: {
                                backgroundColor: theme.palette.secondary.main,
                                }
                            }}
                        >
                            <Tab label="General" {...a11yProps(0)} />
                            <Tab label="Advaned" {...a11yProps(1)} />
                            <Tab label="Web Security" {...a11yProps(2)} />
                        </Tabs>
                    </div>

                </div>
            }
            divider
        >
            
            <TabPanel value={box} index={0}>
                <GeneralSettings setTheme={setTheme} />
            </TabPanel>
            <TabPanel value={box} index={1}>
                <AdvancedSettings />
            </TabPanel>
            <TabPanel value={box} index={2}>
                <WebSecurity />
            </TabPanel>


            {/* <div style={{display:'flex', flexDirection:'row', height: '100%' }}>
                <div 
                    style={{ 
                        width: '45%',
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
                            General
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
                            Database Settings
                        </Typography>

                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                            onClick={ () => { setBox(2) } }
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
                            Frontend Authentication
                        </Typography>

                        <Button
                            variant='contained'
                            sx={{ marginLeft: 'auto' }}
                            onClick={ () => { setBox(3) } }
                        >
                            Open
                        </Button>
                    </div>                

                </div>

                <Box 
                    sx={{
                        borderRadius: 8, 
                        border: `4px solid ${theme.palette.primary.dark}`,
                        padding: 3,
                        width: '55%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowX: 'hidden',
                    }}
                >
                    {
                        pages[box]
                    }
                </Box>
            </div> */}
        </MainBox>

    );
};

export default Settings;


Settings.propTypes = {
    setTheme: PropTypes.func.isRequired,        // function to change the theme
};
