import { Button, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, ListItem, Switch, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import { uninstallPlugin } from '../API/getsetAPI';
import { ParseCustomSettings } from '../scripts/ParseCustomSettings';

const SettingsDialog = ({ uuid, friendlyName, description, home, is_listener, is_interceptor, is_resolver, is_validator, is_inspector, interceptPosition, setInterceptOrder, numInterceptors, pluginState, togglePlugin, dialogOpen, setDialogStatus, settingsPage }) => {
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
            setInterceptOrder(interceptPosition - 1, interceptPosState - 1);
            setDialogStatus(false);
        }
    }

    return (
        <Dialog 
            open={dialogOpen}
        >
            <div style={{ display: 'flex', flexDirection: 'row'   }}
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
            <DialogContent  >
                <div style={{ display: 'flex', flexDirection: 'column' }} >
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
                                            onChange={() => togglePlugin(uuid)}
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
                                    is_listener && <ListItem
                                        sx={{ display: 'list-item', paddingY: 0}}
                                    >
                                        Listener
                                    </ListItem>
                                }
                                {
                                    is_interceptor && <ListItem
                                        sx={{ display: 'list-item', paddingY: 0}}
                                    >
                                        Interceptor
                                    </ListItem>
                                }
                                {
                                    is_resolver && <ListItem
                                        sx={{ display: 'list-item', paddingY: 0}}
                                    >
                                        Resolver
                                    </ListItem>
                                }
                                {
                                    is_validator && <ListItem
                                        sx={{ display: 'list-item', paddingY: 0}}
                                    >
                                        Validator
                                    </ListItem>
                                }
                                {
                                    is_inspector && <ListItem
                                        sx={{ display: 'list-item', paddingY: 0}}
                                    >
                                        Inspector
                                    </ListItem>
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

                    <Divider />

                    <ParseCustomSettings uuid={uuid} settingsJson={settingsPage} />

                </div>
            </DialogContent>
            

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
    uuid: PropTypes.string.isRequired,                  // Plugin info
    friendlyName: PropTypes.string.isRequired,          //
    description: PropTypes.string.isRequired,           //
    home: PropTypes.string.isRequired,                  //
    is_listener: PropTypes.bool.isRequired,             //
    is_interceptor: PropTypes.bool.isRequired,          //
    is_resolver: PropTypes.bool.isRequired,             //
    is_validator: PropTypes.bool.isRequired,            //
    is_inspector: PropTypes.bool.isRequired,            //
    interceptPosition: PropTypes.number,                // Intercept module position
    setInterceptOrder: PropTypes.func.isRequired,       // Change interceptor plugin order
    numInterceptors: PropTypes.number.isRequired,       // Total number of interceptors implemented
    pluginState: PropTypes.bool.isRequired,             // Plugin enabled or disabled
    togglePlugin: PropTypes.func.isRequired,            // Function to toggle a plugin
    dialogOpen: PropTypes.bool.isRequired,              // Dialog open close status
    setDialogStatus: PropTypes.func.isRequired,         // Function to open and close dialog
};
