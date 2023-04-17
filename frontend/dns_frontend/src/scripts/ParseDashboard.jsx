import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@emotion/react';

// To be removed later
import {
    mockDataFruits,
    mockBarData,
    mockLineData,
    mockDataTeam,
    mockGeographyData,
    mockDataContacts,
  } from "../Tmp/TempData";
  

export const ParseDashboard = ({ dashboardJson }) => {
    const theme = useTheme();

    let rows = [];
    let key = 0;

    dashboardJson.forEach((row, index) => {
        
    });

    rows.append(<div>
        <Box 
            sx={{
                borderRadius: 8, 
                padding: 3,
                width: 100,
                height: 100,
                flexGrow: 1,
                alignItems: 'center',
                overflowY: 'auto',
                overflowX: 'hidden',
                border: `4px solid ${theme.palette.primary.dark}`,
            }}
        >
            hello
        </Box>
    </div> 
    );

    return (
        <div style={{ paddingBottom: 30 }} >
            { [rows] }
        </div>
    );
};


{/* <div style={{ width: '19%', display: 'flex', flexDirection: 'column' }} >
    <StatusBox title={"Server"} status={"running"} height={200} />
    { editMode && <div style={{ marginTop: 'auto' }} >
        <Button> Edit </Button>
        </div>
    }
</div> */}