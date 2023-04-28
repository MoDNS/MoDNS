import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { FormControlLabel, Icon, IconButton, Switch, TableCell, TableRow, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsDialog from './SettingsDialog';


import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { getPluginLogo } from '../API/getsetAPI';


const PluginTableRow = ({ uuid, friendlyName, description, home, is_listener, is_interceptor, is_resolver, is_validator, is_inspector, pluginState, togglePlugin, interceptPosition, numInterceptors, setInterceptOrder, index, dragNDrop, dragStart, dragEnter, dragDrop, settingsPage }) => {
    const [dialogOpen, setDialogStatus] = useState(false);

    const [drag, startDrag] = useState(false);

    const [logo, setLogo] = useState();

    useEffect(() => {
        getPluginLogo().then(res => {
            setLogo(res);
        })
    }, [])
    
    return (
        <TableRow
            draggable={drag}
            onDragStart={ (e) => dragStart(e, index) }
            onDragEnter={ (e) => dragEnter(e, index) }
            onDragEnd={ dragNDrop ? dragDrop : null }
            onDragOver={ dragNDrop ? (e) => { e.preventDefault() } : null }
        >
            { dragNDrop && 
                <TableCell width={30} >
                    <Icon>
                        <DragIndicatorIcon
                            sx={{ ":hover": { cursor: 'move' } }} 
                            onMouseDown={ () => startDrag(true) }
                            onMouseUp={ () => startDrag(false) }
                        />
                    </Icon>
                </TableCell>
            }
            {
                false &&
                <TableCell
                    width={90}
                    height={90}
                    align='left'
                    
                    >
                    <img alt="No Logo Found" src={logo} width={65} height={65} style={{ margin: 10 }} draggable={false}/>
                </TableCell>
            }
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
                is_listener={is_listener}
                is_interceptor={is_interceptor}
                is_resolver={is_resolver}
                is_validator={is_validator}
                is_inspector={is_inspector}
                interceptPosition={interceptPosition}
                numInterceptors={numInterceptors}
                // pass dialog open controls and status to dialog
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                togglePlugin={togglePlugin}                             // pass the toggle plugin function to the settings dialog box
                pluginState={pluginState}                               // pass the plugin state to the dialog box
                setInterceptOrder={setInterceptOrder}                   // set order of rows
                settingsPage={settingsPage}

            />

        </TableRow>
    );
};

export default PluginTableRow;

PluginTableRow.propTypes = {
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
    index: PropTypes.number.isRequired,                 // index of item in interceptor order list
    dragNDrop: PropTypes.bool.isRequired,               // If the Table Row should be draggable or not
    dragStart: PropTypes.func.isRequired,               // Function that is called when dragging starts
    dragEnter: PropTypes.func.isRequired,               // Function that is called when dragging over
    dragDrop: PropTypes.func.isRequired,                // Function that is called when dropping the dragged item
    
};

PluginTableRow.defaultProps = {
    dragNDrop: false,
};