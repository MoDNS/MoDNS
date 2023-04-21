import React, { useState } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { useTheme } from '@emotion/react';
import { getDashboardData } from '../API/getsetAPI';

import AddIcon from '@mui/icons-material/Add';

import AddComponent from '../Components/Dashboard/AddComponent';
import EditComponent from '../Components/Dashboard/EditComponent';

import LineChart from '../Components/DashboardComponents/LineChart';
import HorizontalBarChart from '../Components/DashboardComponents/HorizontalBarChart';
import VerticalBarChart from '../Components/DashboardComponents/VerticalBarChart';
import MarimekoChart from '../Components/DashboardComponents/MarimekoChart';
import PieChart from '../Components/DashboardComponents/PieChart';
import StatBox from '../Components/DashboardComponents/StatBox';
import StatusBox from '../Components/DashboardComponents/StatusBox';
import DataTable from '../Components/DashboardComponents/DataTable';
  

export const ParseDashboardPage = ({ editMode, dashboardJson, setDashboardJson }) => {
    
    const theme = useTheme();

    const [addDialog, setAddDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);

    
    const insertComponentAtPosition = (x, y, json) => {
        // x is downward, y is accross
        let xPos = x > dashboardJson.length ? dashboardJson.length : x;
        let yPos = 0;
        if (dashboardJson[xPos]) {
            yPos = y > dashboardJson[xPos].length ? dashboardJson[xPos].length : y;
        }
        
        let newJson = [...dashboardJson];
        let subArray = newJson[xPos] || [];
        subArray.splice(yPos, 0, json);
        newJson.splice(xPos, 1, [...subArray]);

        setDashboardJson([...newJson]);
    }

    const deleteComponent = (x, y) => {
        let dashboardJsonCopy = [...dashboardJson];
        let row = dashboardJsonCopy[x]
        row.splice(y, 1);

        if (row.length !== 0) {
            dashboardJsonCopy.splice(x, 1, row);
        } else {
            dashboardJsonCopy.splice(x, 1);
        }

        setDashboardJson([...dashboardJsonCopy]);
    }


    const getComponent = (type, label, data, height) => {
        const componentDict = {
            "line chart": <LineChart label={label} data={ type === "line chart" ? data : undefined } height={height} />,
            "horizontal bar chart": <HorizontalBarChart label={label} data={ type === "horizontal bar chart" ? data : undefined } height={height} />,
            "marimeko chart": <MarimekoChart label={label} data={ type === "marimeko chart" ? data : undefined } height={height} />,
            "pie chart": <PieChart label={label} data={ type === "pie chart" ? data : undefined } height={height} />,
            "stat box": <StatBox label={label} data={ type === "stat box" ? data : undefined } height={height}/>,
            "status box": <StatusBox label={label} data={ type === "status box" ? data : undefined } height={height} />,
            "table": <DataTable label={label} data={ type === "table" ? data : undefined } height={height} />,
            "vertical bar chart": <VerticalBarChart label={label} data={ type === "vertical bar chart" ? data : undefined } height={height} />,
        }
        return componentDict[type];
    }


    var key = 0;
    let rows = dashboardJson.map((row, x) => {
        let theRow = row.map((component, y) => {
            return <div key={`${x}${y}}`} style={{ width: `${component.width}%`, display: 'flex', flexDirection: 'column' }} >
                <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1 }} >
                    {getComponent(component.type, component.label, getDashboardData(component.uuid, component.key), component.height)}
                </div>
                { editMode && <div style={{ marginTop: 'auto' }} >
                    <>
                        {/* <Button
                            variant='contained'
                        >
                            Edit 
                        </Button> */}
                        <Button
                            variant='contained'
                            sx={{ marginLeft: 2 }}
                            onClick={ () => deleteComponent(x, y) }
                        >
                            Delete
                        </Button>

                    </>
                </div>
                }
            </div>
        });
        theRow.push(
        editMode && <Box 
            key={++key}
            sx={{
                borderRadius: 8, 
                marginY: 1,
                flexGrow: 1,
                maxWidth: 50,
                alignItems: 'center',
                overflow: 'hidden',
                border: `4px solid ${theme.palette.text.primary}`,
            }}
        >
            <IconButton sx={{ height: '100%', width: '100%' }} onClick={() => {
                setInsertPos([x, theRow.length]);
                setAddDialog(true)
            }}
            >
                <AddIcon fontSize='large' />
            </IconButton>

        </Box>);
        return <div key={++key} style={{ display: 'flex', flexDirection: 'row', paddingTop: 10, paddingBottom: 10 }} >
            { theRow }
        </div>
    })

    const [insertPos, setInsertPos] = useState([]);

    rows.push(<div key={++key} >
        {editMode && <Box 
            sx={{
                borderRadius: 8, 
                width: 110,
                height: 110,
                flexGrow: 1,
                alignItems: 'center',
                overflowY: 'auto',
                overflowX: 'hidden',
                border: `4px solid ${theme.palette.text.primary}`,
            }}
        >
            <IconButton sx={{ height: '100%', width: '100%' }} onClick={() => {
                setInsertPos([rows.length, 0]);
                setAddDialog(true)
            }}
            >
                <AddIcon fontSize='large' />
            </IconButton>

        </Box>}
    </div> 
    );

    return (
        <>
            <div key={++key} style={{ paddingBottom: 30, display: 'flex', flexDirection: 'column' }} >
                { [rows] }
            </div>

            <AddComponent key={++key} open={addDialog} setAddDialog={setAddDialog} dashboardJson={dashboardJson} setDashboardJson={insertComponentAtPosition} insertPos={insertPos} />
            <EditComponent key={++key} open={editDialog} setEditDialog={setEditDialog} dashboardJson={dashboardJson} setDashboardJson={insertComponentAtPosition} insertPos={insertPos} />
        </>

    );
};
