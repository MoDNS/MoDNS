import { useTheme } from '@emotion/react';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosSharpIcon from '@mui/icons-material/ArrowBackIosSharp';

import AddElement from './CustomSettingsDialogViews/AddElement';
import MoveElement from './CustomSettingsDialogViews/MoveElement';
import RemoveElement from './CustomSettingsDialogViews/RemoveElement';

const CustomSettingsTools = ({ jsonPage, setJsonPage}) => {
    
    const theme = useTheme();
    
    const [showDialog, setShowDialog] = useState(false);
    const [whichDialog, setWhichDialog] = useState(0);

    const [element, setElement] = useState(["", false]);

    const dialogs = [
        "Add",
        "Move",
        "Remove"
    ]

    const dialogsContent = [
        <AddElement jsonPage={jsonPage} setJsonPage={setJsonPage} setShowDialog={setShowDialog} element={element} setElement={setElement} />,
        <MoveElement jsonPage={jsonPage} setJsonPage={setJsonPage} />,
        <RemoveElement jsonPage={jsonPage} setJsonPage={setJsonPage} />
    ]

    const downloadJson = () => {
        const jsonStr = JSON.stringify(jsonPage, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = "custom_settings.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }
    
    return (
        <>
            <Typography
                fontSize={28}
                marginBottom={2}
            >
                Options
            </Typography>
            
            <Button
                variant='contained'
                sx={{ marginBottom: 1 }}
                onClick={ () => { setWhichDialog(0); setShowDialog(true); } }
                fullWidth

            >
                Add
            </Button>
            <Button
                variant='contained'
                sx={{ marginBottom: 1 }}
                onClick={ () => { setWhichDialog(1); setShowDialog(true); } }
                fullWidth
            >
                Move
            </Button>
            <Button
                variant='contained'
                sx={{ marginBottom: 1 }}
                onClick={ () => { setWhichDialog(2); setShowDialog(true); } }
                fullWidth
            >
                Remove
            </Button>


            <Button
                variant='contained'
                sx={{ marginBottom: 1, marginTop: 'auto' }}
                fullWidth
                onClick={() => downloadJson()}
            >
                Download
            </Button>


            <Dialog
                PaperProps={{
                    style: {
                        backgroundColor: theme.palette.primary.main,
                    }
                }}
                sx={{ overflowX: 'hidden' }}
                open={showDialog}
            >
                <div style={{ display: 'flex', flexDirection: 'row'   }}
                >
                    <DialogTitle
                        fontSize={35}
                        sx={{ marginRight: 'auto', marginBottom: 0, paddingBottom: 1, }}
                    >
                        { dialogs[whichDialog] }
                    </DialogTitle>
                    { element[1] &&
                        <IconButton
                            onClick={() => { setElement([element[0], false]) }}
                            sx={{ marginLeft: 5.5, marginTop: 2, marginBottom: 'auto', marginRight: 1, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                        >
                            <ArrowBackIosSharpIcon fontSize='small' />
                        </IconButton>
                    }
                    <IconButton
                        onClick={() => { 
                            setShowDialog(false);
                            if (element[0]) {
                                setElement(["", false]);
                            }
                        }}
                        sx={{marginTop: 2, marginBottom: 'auto', marginRight: 2, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <DialogContent
                    sx={{ overflowX: 'hidden' }}
                >
                    {
                        dialogsContent[whichDialog]
                    }
                </DialogContent>
            </Dialog>

        </>

    );
};

export default CustomSettingsTools;