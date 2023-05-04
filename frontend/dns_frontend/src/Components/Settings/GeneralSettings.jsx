import React from 'react';
import { Typography, Button, Select, Tooltip, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { getDashboardLayout, getDashboardSource, getThemeStorage, setDashboardLayout, setDashboardSource, setThemeStorage } from '../../scripts/getsetLocalStorage';

import ThemeSelector from './ThemeSelector';
import SettingBox from './SettingBox';
import { DASHBOARD_SOURCE_KEY, THEME_KEY } from '../../Constants';
import { getDashboardLayoutAPI, setDashboardLayoutAPI } from '../../API/getsetAPI';


const GeneralSettings = ({ setTheme }) => {

    const [oldSettings, setOldSettings] = useState({});
    const [currentSettings, setCurrentSettings] = useState({});

    useEffect(() => {
        let currSett = {
            'theme': getThemeStorage(),
            'dashboard_source': getDashboardSource(),
        }
        setOldSettings({...currSett});
        setCurrentSettings({...currSett});
    }, []);


    const handleChange = (key, value) => {
        let x = {...currentSettings};
        x[key] = value;
        setCurrentSettings({...x});
    }


    const applyChanges = () => {
        if (currentSettings[DASHBOARD_SOURCE_KEY] !== oldSettings[DASHBOARD_SOURCE_KEY]) {
            setDashboardSource(currentSettings[DASHBOARD_SOURCE_KEY]);
        }
        if (currentSettings[THEME_KEY] !== oldSettings[THEME_KEY]) {
            setThemeStorage(currentSettings[THEME_KEY]);
            setTheme(currentSettings[THEME_KEY]);
        }
        
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row' }} >
                <Typography
                    sx={{
                        fontSize: 35,
                    }}
                >
                    General Settings
                </Typography>
                <Button
                    variant="contained"
                    sx={{ marginLeft: 'auto', marginTop: 'auto', marginBotom: 'auto' }}
                    onClick={() => {applyChanges()}}
                >
                    Apply Changes
                </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', paddingLeft: 50, paddingRight: 50, overflowY: 'auto', paddingTop: 30, paddingBottom: 30, justifyContent: 'space-between' }} >
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                    <SettingBox title={"Dashboard Settings"} >
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Tooltip title={"For this device, use the global dashboard or opt out and use a local dashboard"} >
                                <Typography
                                    sx={{ 
                                        fontSize: 25,
                                        marginRight: 'auto',
                                    }}
                                    >
                                    Dashboard Source:
                                </Typography>
                            </Tooltip>

                            <Select
                                value={currentSettings[DASHBOARD_SOURCE_KEY] || ''}
                                onChange={(e) => {
                                    handleChange(DASHBOARD_SOURCE_KEY, e.target.value)
                                }}
                            >
                                <MenuItem value={'g'} > Global Dashboard </MenuItem>
                                <MenuItem value={'l'} > Local Dashboard </MenuItem>
                            </Select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20 }}>
                            <Button
                                variant='contained'
                                sx={{ marginRight: 1 }}
                                onClick={() => {
                                    getDashboardLayoutAPI().then(res => {
                                        setDashboardLayout((res && res.dashboard) || []);
                                    })
                                }}
                            >
                                Copy Global to Local Dashboard
                            </Button>
                            <Button
                                sx={{ marginLeft: 1 }}
                                onClick={() => {
                                    let x = getDashboardLayout();
                                    setDashboardLayoutAPI(x);
                                }}
                                variant='contained'
                            >
                                Copy Local to Global Dashboard
                            </Button>
                        </div>
                    </SettingBox>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                    <SettingBox title={"Theme Selector"} noFullWidth>
                        <ThemeSelector selectedTheme={currentSettings[THEME_KEY]} setSelectedTheme={handleChange} />
                    </SettingBox>
                </div>
                
            </div>
        </>
    );
};

export default GeneralSettings;