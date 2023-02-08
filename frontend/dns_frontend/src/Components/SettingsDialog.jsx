import { Button, Dialog, DialogTitle, FormControlLabel, IconButton, ListItem, Switch, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

const SettingsDialog = ({ uuid, friendlyName, description, home, modules, interceptPosition, numInterceptors, dialogOpen, setDialogStatus, togglePlugin, pluginState, setPluginLists }) => {
    const theme = useTheme();

    const [interceptPosState, setInterceptPositionState] = useState(interceptPosition);

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
                    <IconButton
                        onClick={() => setDialogStatus(false)}
                        sx={{ marginLeft: 5.5, marginTop: 2, marginBottom: 'auto', marginRight: 2, padding: 1, height: 30, width: 30, backgroundColor: theme.palette.secondary.main }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
                <div style={{ paddingLeft: 25, paddingRight: 25, paddingBottom: 25, display: 'flex', flexDirection: 'row' }} >
                    <div style={{ width: '60%', flexDirection: 'column', display: 'flex' }}>
                        <Typography
                            fontSize={25}
                        >
                            Description
                        </Typography>
                        <Typography
                            noWrap={false}
                        >
                            {description}
                        </Typography>
                        <FormControlLabel
                            sx={{ marginRight: 'auto', marginTop: 2, marginLeft: 0 }}
                            label={<Typography fontSize={25} > Mod Status </Typography>}
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
                                sx={{ marginRight: 'auto', marginY: 2, marginLeft: 0}}
                                label={<Typography fontSize={25} > Interceptor Position </Typography>}
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
                            fontSize={25}
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
            </div>
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
