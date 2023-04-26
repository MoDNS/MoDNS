import { Box, MenuItem, Select, useTheme } from '@mui/material';
import React, { useState } from 'react';
import MainBox from '../Components/MainBox';
import CustomSettings from '../Components/Tools/CustomSettings/CustomSettings';
import CustomSettingsTools from '../Components/Tools/CustomSettings/CustomSettingsTools';

const Tools = () => {
    const theme = useTheme();

    const [buildBox, setBuildBox] = useState(0);

    const [jsonPage, setJsonPage] = useState([]);

    const buildBoxes = [ 
        <CustomSettings jsonPage={jsonPage} />
    ]
    const toolBoxes = [
        <CustomSettingsTools setJsonPage={setJsonPage} jsonPage={jsonPage} />
    ]

    return (
        <MainBox
            title={
                [
                    <div key={1} style={{ display: 'flex', flexDirection: 'row'}} >
                      Tools
                      <Select 
                        value={buildBox}
                        sx={{ marginLeft: 'auto', marginY: 'auto' }} 
                        onChange={(e) => {
                            setBuildBox(e.target.value);
                        }}
                      >
                        <MenuItem value={0}> Custom Settings Page Builder</MenuItem>
                      </Select>
                    </div>
                  ]
            }
            divider
        >
            <div style={{ display: 'flex', flexDirection:'row', overflow: 'hidden', flexGrow: 1 }}>
                
                <Box
                    sx={{
                        borderRadius: 8, 
                        padding: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'center',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        marginX: 1,
                        border: `4px solid ${theme.palette.primary.dark}`,
                    }}
                >
                    {
                        toolBoxes[buildBox]
                    }
                </Box>
                <Box
                    sx={{
                        borderRadius: 8, 
                        padding: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowX: 'hidden',
                        border: `4px solid ${theme.palette.primary.dark}`,
                        minWidth: '125vh',
                        maxWidth: '125vh',
                        overflowY: 'hidden'
                    }}
                >
                    <div style={{ height:"100%", width: '100%', overflowY: 'auto' }} >
                        <div style={{ flexDirection: 'column', display: 'flex'}} >
                            {
                                buildBoxes[buildBox]
                            }
                        </div>
                    </div>
                </Box>
            </div>


        </MainBox>
    );
};

export default Tools;