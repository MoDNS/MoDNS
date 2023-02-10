import { Button, Dialog, DialogTitle, FormControlLabel, IconButton, ListItem, Switch, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import { uninstallPlugin } from '../API/getsetAPI';

const SettingsDialog = ({ uuid, friendlyName, description, home, modules, interceptPosition, numInterceptors, dialogOpen, setDialogStatus, togglePlugin, pluginState, setPluginLists }) => {
    const theme = useTheme();

    const [interceptPosState, setInterceptPositionState] = useState(interceptPosition);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showUninstallDialog, setShowUninstallDialog] = useState(false);

    const uninstallConfirm = (confirm) => {
        setShowUninstallDialog(false);
        if (confirm) {
            uninstallPlugin(uuid);
            setDialogStatus(false);
        }
    }

    const applyInterceptPosition = (e) => {
        if (interceptPosState) {
            setPluginLists('interceptor', interceptPosition - 1, interceptPosState - 1);
            setDialogStatus(false);
        }
    }


    return (
        <Dialog 
            open={dialogOpen}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }} >
                <div style={{ display: 'flex', flexDirection: 'row' }}
                >
                    <DialogTitle
                        fontSize={35}
                        sx={{ marginRight: 'auto', marginBottom: 0, paddingBottom: 1, }}
                    >
                        { friendlyName }
                    </DialogTitle>
                    <Button
                        onClick={() => setShowAdvanced(!showAdvanced) }
                    >
                        { !showAdvanced ? "Advanced" : "Back" }
                    </Button>
                    <IconButton
                        onClick={() => { setShowAdvanced(false); setDialogStatus(false);}}
                        sx={{ marginLeft: 5.5, marginTop: 2, marginBottom: 'auto', marginRight: 2, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                { !showAdvanced ?
                    <div style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 25, display: 'flex', flexDirection: 'row' }} >
                        <div style={{ width: '60%', flexDirection: 'column', display: 'flex' }}>
                            <Typography
                                fontSize={22}
                            >
                                Description
                            </Typography>
                            <Typography
                                noWrap={false}
                            >
                                {description}
                            </Typography>
                            <FormControlLabel
                                sx={{ marginRight: 'auto', marginTop: 3, marginLeft: 0 }}
                                label={<Typography fontSize={22} > Mod Status </Typography>}
                                labelPlacement={'start'}
                                control={
                                    <Switch 
                                        sx={{ marginLeft: 3, }}
                                        checked={pluginState}
                                        onChange={() => togglePlugin(uuid, modules[0])}
                                    />
                                } 
                            />
                            {
                                interceptPosition &&
                                <FormControlLabel
                                    sx={{ marginRight: 'auto', marginBottom: 2, marginTop: 3, marginLeft: 0}}
                                    label={<Typography fontSize={22} > Interceptor Position </Typography>}
                                    labelPlacement={'start'}
                                    control={
                                        <div>

                                        <TextField 
                                            type={"number"}
                                            placeholder={ `${interceptPosition}` }
                                            inputProps={{style: { textAlign: 'center', }, min: 1, max: numInterceptors }}
                                            sx={{ marginX: 3, width: 60, }}
                                            defaultValue={ interceptPosition }
                                            onInput={ (e) => setInterceptPositionState(e.target.value) }
                                            
                                        />
                                        <Button
                                            onClick={(e) => applyInterceptPosition(e) }
                                            variant="contained"
                                        >
                                            Apply
                                        </Button>
                                        </div>
                                    } 
                                />
                            }
                        </div>
                        <div style={{ width: '30%', marginLeft: 'auto' }}>
                            <Typography
                                fontSize={22}
                            >
                                Modules
                            </Typography>
                            {
                                modules && modules.map((implementation, index) => {
                                    return (
                                        <ListItem
                                            key={index}
                                            sx={{ display: 'list-item', paddingY: 0}}
                                        >
                                            {implementation.charAt(0).toUpperCase() + implementation.slice(1)}
                                        </ListItem>
                                    )
                                })
                            }
                        </div>
                    </div>
                    :
                    <div style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 25, display: 'flex', flexDirection: 'row' }} >
                        <div style={{ display: 'flex', flexDirection: 'column', width: '55%' }}>
                            <Typography
                                fontSize={20}
                                sx={{ verticalAlign: 'bottom', marginRight: 2 }}
                                lineHeight={'25px'}
                            >
                                UUID:
                            </Typography>
                            <Typography
                                fontSize={20}
                                sx={{ verticalAlign: 'bottom', marginRight: 2 }}
                                lineHeight={'25px'}
                            >
                                Mod Install Location:
                            </Typography>
                            
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '45%' }}>
                            <Typography
                                sx={{ verticalAlign: 'bottom' }}
                                lineHeight={'25px'}
                                >
                                {uuid}
                            </Typography>
                            <Typography
                                sx={{ verticalAlign: 'bottom' }}
                                lineHeight={'25px'}
                                >
                                {home}
                            </Typography>
                            <Button
                                sx={{ marginTop: 3, marginLeft: 'auto', marginRight: 2 }}
                                variant='contained'
                                onClick={() => setShowUninstallDialog(true)}
                            >
                                Uninstall
                            </Button>                           
                        </div>
                    </div>
                }
            </div>
            <Dialog
                PaperProps={{
                    style: {
                        backgroundColor: theme.palette.primary.main,
                    }
                }}
                open={showUninstallDialog}
            >
                <DialogTitle
                    fontSize={25}
                    sx={{ paddingBottom: 1 }}
                >
                    Are you sure you would like to continue?
                </DialogTitle>
                <Typography
                    sx={{ paddingLeft: 3, textAlign: 'right', paddingRight: 3, paddingBottom: 2, }}
                >
                    Uninstalling requires a restart of the MoDNS Server.
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'right', paddingRight: 20, paddingBottom: 20, marginTop: 'auto' }} >
                    <Button
                        sx={{ marginRight: 2 }}
                        variant='contained'
                        onClick={ () => uninstallConfirm(false) }
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={ () => uninstallConfirm(true) }
                    >
                        Confirm
                    </Button>
                </div>
            </Dialog>
        </Dialog>
    );
};

export default SettingsDialog;


SettingsDialog.propTypes = {
    uuid: PropTypes.string.isRequired,                  // plugin attributes
    friendlyName: PropTypes.string.isRequired,          //
    description: PropTypes.string.isRequired,           //
    home: PropTypes.string.isRequired,                  //
    modules: PropTypes.array.isRequired,                //
    interceptPosition: PropTypes.number,                //
    numInterceptors: PropTypes.number,                  // total number of interceptor plugins installed
    dialogOpen: PropTypes.bool.isRequired,              // dialog open/close status
    setDialogStatus: PropTypes.func.isRequired,         // open/close dialog
    togglePlugin: PropTypes.func.isRequired,            // function to enable / disable a plugin
    pluginState: PropTypes.bool.isRequired,             // enabled / disabled state of plugin
    setPluginLists: PropTypes.func.isRequired,          // reorder plugins that allow drag n drop
};
