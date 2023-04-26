import { useTheme } from '@emotion/react';
import { Button, Dialog, DialogContent, DialogTitle, Icon, IconButton, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';
import CloseIcon from '@mui/icons-material/Close';

import BarChartIcon from '@mui/icons-material/BarChart';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import NumbersIcon from '@mui/icons-material/Numbers';

const AddComponent = ({ open, setAddDialog, dashboardJson, setDashboardJson, insertPos }) => {
    const theme = useTheme();

    const [component, setComponent] = useState(["", false]);


    const capitalizeWords = (sentence) => {
        let sentenceArr = sentence.split(' ');
        let finalSentence = "";
        sentenceArr.forEach((word, index) => {
            finalSentence += word.charAt(0).toUpperCase() + word.substring(1)
            if (index !== sentenceArr.length) {
                finalSentence += " "
            }
        });
        return finalSentence;
    }
    

    const [text, setText] = useState("");
    const [uuid, setUUID] = useState("");
    const [key, setKey] = useState("");
    const [width, setWidth] = useState(50);
    const [height, setHeight] = useState(300);

    const componentLabel = {
        "line chart": <Icon sx={{ marginRight: 1, }} >
            <SsidChartIcon />
        </Icon>,
        "horizontal bar chart": <Icon sx={{ marginRight: 1, }} >
            <BarChartIcon
                sx={{ 
                    transform: 'rotate(90deg)',
                }}
            />
        </Icon>,
        "marimeko chart": <Icon sx={{ marginRight: 1, }} >
            <StackedBarChartIcon />
        </Icon>,
        "pie chart": <Icon sx={{ marginRight: 1, }} >
            <PieChartIcon />
        </Icon>,
        "stat box": <Icon sx={{ marginRight: 1, }} >
            <NumbersIcon />
        </Icon>,
        "status box": <Icon sx={{ marginRight: 1, }} >
            <OnlinePredictionIcon />
        </Icon>,
        "table": <Icon sx={{ marginRight: 1, }} >
            <TableChartIcon />
        </Icon>,
        "vertical bar chart": <Icon sx={{ marginRight: 1, }} >
            <BarChartIcon />
        </Icon>,
    }

    return (
        <Dialog 
            PaperProps={{
                style: {
                    backgroundColor: theme.palette.primary.main,
                }
            }}
            sx={{ overflowX: 'hidden' }}
            open={open}
        >
            <div style={{ display: 'flex', flexDirection: 'row' }}
            >
                <DialogTitle
                        fontSize={35}
                        sx={{ marginRight: 'auto', marginBottom: 0, paddingBottom: 1, }}
                    >
                        Add Component
                </DialogTitle>
                { component[1] &&
                        <IconButton
                            onClick={() => { 
                                setText("");
                                setUUID("");
                                setKey("");
                                setWidth(50);
                                setHeight(300);
                                setComponent([component[0], false]);
                            }}
                            sx={{ marginLeft: 5.5, marginTop: 2, marginBottom: 'auto', marginRight: 1, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                        >
                            <ArrowBackIosSharpIcon fontSize='small' />
                        </IconButton>
                }
                <IconButton
                    onClick={() => { 
                        setText("");
                        setUUID("");
                        setKey("");
                        setWidth(50);
                        setHeight(300);
                        setComponent(["", false]);
                        setAddDialog(false);
                    }}
                    sx={{marginTop: 2, marginBottom: 'auto', marginRight: 2, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            <DialogContent>
                <div style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 25, display: 'flex', flexDirection: 'column' }} >
                    { !component[1] ? 
                        <>
                            <Typography
                                fontSize={22}
                            >
                                What type of component woud you like to add ?
                            </Typography>
                            <Select
                                value={component[0]}
                                onChange={(e) => {
                                    let comp = component;
                                    comp[0] = e.target.value;
                                    setComponent([...comp]);
                                }}
                            >
                                <MenuItem value={'line chart'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["line chart"]} 
                                        <Typography>
                                            Line Chart 
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'horizontal bar chart'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["horizontal bar chart"]} 
                                        <Typography>
                                            Horizontal Bar Chart
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'marimeko chart'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["marimeko chart"]} 
                                        <Typography>
                                            Marimeko Chart
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'pie chart'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["pie chart"]} 
                                        <Typography>
                                            Pie Chart
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'stat box'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["stat box"]} 
                                        <Typography>
                                            Stat Box
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'status box'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["status box"]} 
                                        <Typography>
                                            Status Box
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'table'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["table"]} 
                                        <Typography>
                                            Table
                                        </Typography>   
                                    </div>
                                </MenuItem>
                                <MenuItem value={'vertical bar chart'} >
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        {componentLabel["vertical bar chart"]} 
                                        <Typography>
                                            Vertical Bar Chart
                                        </Typography>   
                                    </div>
                                </MenuItem>

                            </Select>
                            <Button
                                sx={{ marginTop: 2 }}
                                variant='contained'
                                onClick={() => {
                                    if (component[0]) {
                                        let comp = component;
                                        comp[1] = true;
                                        setComponent([...comp]);
                                    }
                                }}
                            >
                                Next
                            </Button>
                        </>
                        :
                        <>
                            <Typography
                                fontSize={22}
                            >
                                {
                                    componentLabel[component[0]]
                                }
                                {
                                    capitalizeWords(component[0])
                                }
                            </Typography>
                            <>
                                <Typography
                                    fontSize={20}
                                    marginTop={4}
                                >
                                    What should the chart's label say?
                                </Typography>
                                <TextField
                                    value={text}
                                    variant='standard'
                                    onChange={ (e) => setText(e.target.value) }
                                />

                                <Typography
                                    marginTop={4}
                                    fontSize={20}
                                >
                                    What is the UUID of the plugin supplying the data?
                                </Typography>
                                <TextField
                                    value={uuid}
                                    variant='standard'
                                    onChange={ (e) => setUUID(e.target.value) }
                                />

                                <Typography
                                    marginTop={4}
                                    fontSize={20}
                                >
                                    What is the key used to fetch the data from the plugin?
                                </Typography>
                                <TextField
                                    value={key}
                                    variant='standard'
                                    onChange={ (e) => setKey(e.target.value) }
                                />
                                <Typography
                                    marginTop={4}
                                    fontSize={20}
                                >
                                    What is the width of the component?
                                </Typography>
                                <TextField
                                    value={width}
                                    variant='standard'
                                    onChange={ (e) => {
                                        let input = e.target.value;
                                        if(/^\d*$/.test(input)){
                                            setWidth(input);
                                        }
                                    }}
                                    sx={{ width: 100, marginX: 'auto' }}
                                    inputProps={{style: { textAlign: 'right', paddingRight: 2, }}}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment sx={{ marginLeft: 0, marginBottom: 0.7,}} position='end'>
                                                <Typography >
                                                    %
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <Typography
                                >
                                    Note: Percentage of horizontal space this component takes up.
                                </Typography>

                                <Typography
                                    marginTop={4}
                                    fontSize={20}
                                >
                                    What is the height of the component?
                                </Typography>
                                <TextField
                                    value={height}
                                    type={"number"}
                                    variant='standard'
                                    inputProps={{style: { textAlign: 'right', paddingRight: 2, }}}
                                    sx={{ width: 100, marginX: 'auto' }}
                                    onChange={ (e) => setHeight(e.target.value) }
                                />
                                <Typography
                                    noWrap={false}
                                >
                                    Note: Please provide a number.
                                    It is helpful to use the same height for all items on a row.
                                    You may want to start around a value of 200.
                                </Typography>

                                <Button
                                    variant='contained'
                                    sx={{ marginTop: 2 }}
                                    onClick={ () => {
                                        if (text === "" || key === "" || height === "" || width === "") {
                                            alert("Input must not be empty");
                                            return
                                        }
                                        let newJson = {
                                            "type": component[0],
                                            "label": text,
                                            "plugin_uuid": uuid,
                                            "key": key,
                                            "width": Number(width),
                                            "height": Number(height),
                                        }
                                        setAddDialog(false);

                                        setDashboardJson(insertPos[0], insertPos[1], newJson);
                                        
                                        setText("");
                                        setUUID("");
                                        setKey("");
                                        setWidth(50);
                                        setHeight(300);
                                        setComponent(["", false]);
                                    }}
                                >
                                    Submit
                                </Button>
                            </>
                        </>
                    }
                </div>

            </DialogContent>

        </Dialog>
    );
};

export default AddComponent;