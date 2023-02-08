import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { FormControlLabel, IconButton, Switch, TableCell, TableRow, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsDialog from './SettingsDialog';

import defaultPluginLogo from '../images/default_plugin_logo.svg';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';


const PluginTableRow = ({ uuid, friendlyName, description, home, modules, interceptPosition, numInterceptors, pluginState, togglePlugin, dragNDrop, index, dragStart, dragEnter, dragDrop, setPluginLists, }) => {
    const [dialogOpen, setDialogStatus] = useState(false);
    
    return (
        <TableRow
            draggable={dragNDrop}
            onDragStart={ () => dragStart(index) }
            onDragEnter={ () => dragEnter(index) }
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
                            onChange={() => togglePlugin(uuid, modules[0])}         // toggles the plugin with this uuid
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
                numInterceptors={numInterceptors}
                // pass dialog open controls and status to dialog
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                togglePlugin={togglePlugin}                             // pass the toggle plugin function to the settings dialog box
                pluginState={pluginState}                               // pass the plugin state to the dialog box
                setPluginLists={setPluginLists}                                 // set order of rows

            />

        </TableRow>
    );
};

export default PluginTableRow;

PluginTableRow.propTypes = {
    uuid: PropTypes.string.isRequired,                  // plugin attributes
    friendlyName: PropTypes.string.isRequired,          //
    description: PropTypes.string.isRequired,           //
    home: PropTypes.string.isRequired,                  //
    modules: PropTypes.array.isRequired,                //
    interceptPosition: PropTypes.number,                //
    numInterceptors: PropTypes.number,                  // total number of interceptor plugins installed
    pluginState: PropTypes.bool.isRequired,             // enabled / disabled state of plugin
    togglePlugin: PropTypes.func.isRequired,            // function to enable / disable a plugin
    dragNDrop: PropTypes.bool,                          // if table should implement Drag and Drop Features
    index: PropTypes.number.isRequired,                 // current index of row in table
    dragStart: PropTypes.func.isRequired,               // function called when dragging is start
    dragEnter: PropTypes.func.isRequired,               // function called when dragging over a drop area
    dragDrop:PropTypes.func.isRequired,                 // function called when dropping a dragged item
    setPluginLists: PropTypes.func.isRequired,          // function to set order of rows on table
    
};

PluginTableRow.defaultProps = {
    dragNDrop: false,
};