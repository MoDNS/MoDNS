import { Dialog, DialogTitle, FormControlLabel, IconButton, ListItem, Switch, Typography, useTheme } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

const SettingsDialog = ({ uuid, friendlyName, description, home, modules, interceptPosition, dialogOpen, setDialogStatus, pluginEnabled, handleModSwitch }) => {
    const theme = useTheme();

    return (
        <Dialog 
            open={dialogOpen}
            PaperProps={{
                style: {
                    backgroundColor: theme.palette.primary.main,
                    width: 900,
                    height: 600,
                    maxWidth: 1400,
                },
            }}
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
                    <div style={{ width: '60%' }}>
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
                            sx={{ marginRight: 0, marginY: 2, marginLeft: 0}}
                            label={<Typography fontSize={25} >Mod Status</Typography>}
                            labelPlacement={'start'}
                            control={
                                <Switch 
                                    sx={{ marginLeft: 3, }}
                                    checked={pluginEnabled}
                                    onChange={handleModSwitch}
                                />
                            } 
                        />
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
    uuid: PropTypes.string.isRequired,
    friendlyName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    home: PropTypes.string.isRequired,
    modules: PropTypes.array.isRequired,
    interceptPosition: PropTypes.number,
    pluginEnabled: PropTypes.bool.isRequired,
    dialogOpen: PropTypes.bool.isRequired,
    setDialogStatus: PropTypes.func.isRequired,
};
