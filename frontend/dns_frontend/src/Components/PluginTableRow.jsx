import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { FormControlLabel, IconButton, Switch, TableCell, TableRow, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsDialog from './SettingsDialog';

import defaultPluginLogo from '../images/default_plugin_logo.svg';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';


const PluginTableRow = ({ uuid, friendlyName, description, home, modules, interceptPosition, pluginState, togglePlugin, dragNDrop, index, dragStart, dragEnter, dragDrop }) => {
    const [dialogOpen, setDialogStatus] = useState(false);
    

    return (
        <TableRow
            draggable={dragNDrop}
            onDragStart={ (e) => dragStart(e, index) }
            onDragEnter={ (e) => dragEnter(e, index) }
            onDragEnd={ dragNDrop ? dragDrop : null }
        >
            { dragNDrop && 
                <TableCell width={30} >
                    < DragIndicatorIcon />
                </TableCell>
            }
            <TableCell
                width={90}
                height={90}
                align='left'
                
                >
                <img src={defaultPluginLogo} alt="No Logo Found" width={65} height={65} style={{ margin: 10 }} draggable={false}/>    { /* dummy logo */ }
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
                    onClick={() => setDialogStatus(true)}                  // open dialog
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
                            onChange={() => togglePlugin(uuid)}         // toggles the plugin with this uuid
                        />
                    } 
                    sx={{ marginRight: 0, marginY: 'auto', marginLeft: 1 }}
                />
            </TableCell>
            <SettingsDialog
                // plugin info
                uuid={uuid}
                friendlyName={friendlyName}
                description={description}
                home={home}
                modules={modules}
                interceptPosition={interceptPosition}
                // pass dialog open controls and status to dialog
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                
                togglePlugin={togglePlugin}                             // pass the toggle plugin function to the settings dialog box
                pluginState={pluginState}                               // pass the plugin state to the dialog box
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