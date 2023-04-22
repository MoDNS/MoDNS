import { useTheme } from '@emotion/react';
import { Dialog, DialogTitle, IconButton } from '@mui/material';
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';

const EditComponent = ({ open, setEditDialog, dashboardJson, setDashboardJson }) => {
    const theme = useTheme();

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
                        Edit Component
                </DialogTitle>
                <IconButton
                    onClick={() => { 
                        setEditDialog(false);
                    }}
                    sx={{marginTop: 2, marginBottom: 'auto', marginRight: 2, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            

        </Dialog>
    );
};

export default EditComponent;