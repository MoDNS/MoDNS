import { Table, TableBody, TableContainer, Typography } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { useRef } from 'react';
import { PropTypes } from 'prop-types';

const PluginTable = ({ dragNDrop, pluginDict, numInterceptors, pluginsEnabledDict, togglePlugin, interceptorUuidOrder, setInterceptOrder, module, settingsPagesDict }) => {

    const dragItem = useRef();
    const dragOverItem = useRef();

    const dragStart = (event, position) => {
        event.dataTransfer.effectAllowed = 'move';
        dragItem.current = position;
    };

    const dragEnter = (event, position) => {
        event.preventDefault();
        dragOverItem.current = position;
    };

    const dragDrop = (event) => {
        event.preventDefault();
        setInterceptOrder(dragItem.current, dragOverItem.current);
    };

    return (
        <div>
            {
                Object.keys(pluginDict || {}).length !== 0 ? <TableContainer >
                    <Table >
                        <TableBody >
                            {
                                (module === 'interceptor' ? interceptorUuidOrder : Object.keys(pluginDict || {})).map((key, index) => (
                                    <PluginTableRow 
                                        key={index} 
                                        // plugin elements
                                        uuid={key} 
                                        friendlyName={pluginDict[key].friendly_name} 
                                        description={pluginDict[key].description} 
                                        home={pluginDict[key].home} 
                                        is_listener={pluginDict[key].is_listener}
                                        is_interceptor={pluginDict[key].is_interceptor}
                                        is_resolver={pluginDict[key].is_resolver}
                                        is_validator={pluginDict[key].is_validator}
                                        is_inspector={pluginDict[key].is_inspector}
                                        
                                        
                                        pluginState={pluginsEnabledDict[key]}
                                        togglePlugin={togglePlugin}
                                        
                                        interceptPosition={ interceptorUuidOrder.includes(key) ? interceptorUuidOrder.indexOf(key) + 1 : null }
                                        numInterceptors={numInterceptors}
                                        setInterceptOrder={setInterceptOrder}
                                        
                                        dragNDrop={dragNDrop}                   // enables dragging and dropping of rows
                                        index={index}
                                        dragStart={dragStart}
                                        dragEnter={dragEnter}
                                        dragDrop={dragDrop}

                                        settingsPage={settingsPagesDict[key]}
                                        
                                        />
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                :
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10}} >
                    <Typography
                        fontSize={20}
                    >
                        {`No plugins of module ${module.charAt(0).toUpperCase()}${module.substring(1)} installed yet.`}
                    </Typography>
                </div>
            }
            
        </div>
    );
};

export default PluginTable;


PluginTable.propTypes = {
    dragNDrop: PropTypes.bool,
    pluginDict: PropTypes.object.isRequired,                // Dictionary of all Plugins by uuid
    numInterceptors: PropTypes.number.isRequired,           // Total number of interceptors implemented
    pluginsEnabledDict: PropTypes.object.isRequired,        // Dictionary of what plugins are enabled
    togglePlugin: PropTypes.func.isRequired,                // Function to toggle a plugin
    interceptorUuidOrder: PropTypes.array.isRequired,       // Array for ordering interceptor plugins by uuid
    setInterceptOrder: PropTypes.func.isRequired,           // Change interceptor plugin order
    module: PropTypes.string.isRequired,                    // What module the table is showing
};

PluginTable.defaultProps = {
    dragNDrop: false,                                       // Table allows drag n drop or not, default no
};