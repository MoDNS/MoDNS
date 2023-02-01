import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { enabledisableMod } from '../API/getsetAPI';
import { FormControlLabel, IconButton, Switch, TableCell, TableRow, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsDialog from './SettingsDialog';

import defaultPluginLogo from '../images/default_plugin_logo.svg';


const PluginTableRow = ({ uuid, friendlyName, description, home, modules, interceptPosition, pluginState, togglePlugin }) => {
    const [dialogOpen, setDialogStatus] = useState(false);
    
    const handleModSwitch = () => {
        enabledisableMod(uuid, !pluginState);
        togglePlugin(uuid);
    }

    return (
        <TableRow>
            <TableCell
                width={90}
                height={90}
                align='left'
                >
                <img src={defaultPluginLogo} alt="No Logo Found" width={65} height={65} style={{ margin: 10 }}/>
            </TableCell>
            <TableCell
                align='left'
                sx={{ paddingRight: 5 }}
            >
                <Typography
                    fontSize={25}
                >
                    { friendlyName }
                </Typography>
            </TableCell>
            <TableCell
                width={'40%'}
            >
                { description }
            </TableCell>
            <TableCell
                width={150}
            >
                <IconButton
                    sx={{ marginLeft: 1, }}
                    onClick={() => setDialogStatus(true)}
                >
                    <SettingsIcon 
                        fontSize='large' 
                        sx={{ 
                            transitionProperty: 'transform',
                            '&:hover': {
                                transform: 'rotate(90deg)',
                            },
                        }}
                    />
                </IconButton>
                <FormControlLabel 
                    control={
                        <Switch 
                            checked={pluginState}
                            onChange={handleModSwitch}
                        />
                    } 
                    sx={{ marginRight: 0, marginY: 'auto', marginLeft: 1 }}
                />
            </TableCell>
            <SettingsDialog
                uuid={uuid}
                friendlyName={friendlyName}
                description={description}
                home={home}
                modules={modules}
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                handleModSwitch={handleModSwitch}
                pluginEnabled={pluginState}
            />

        </TableRow>
    );
};

export default PluginTableRow;

PluginTableRow.propTypes = {
    uuid: PropTypes.string.isRequired,
    friendlyName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    home: PropTypes.string.isRequired,
    modules: PropTypes.array.isRequired,
    interceptPosition: PropTypes.number,
    pluginState: PropTypes.bool.isRequired,
};