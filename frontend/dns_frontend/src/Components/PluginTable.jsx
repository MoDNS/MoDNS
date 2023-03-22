import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { useRef } from 'react';
import { PropTypes } from 'prop-types';

const PluginTable = ({ dragNDrop, pluginDict, numInterceptors, pluginsEnabledDict, togglePlugin, interceptorUuidOrder, setInterceptOrder, module }) => {

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
            <TableContainer >
                <Table >
                    <TableBody >
                        {
                            (module === 'interceptor' ? interceptorUuidOrder : Object.keys(pluginDict)).map((key, index) => (
                                <PluginTableRow 
                                    key={index} 
                                    // plugin elements
                                    uuid={key} 
                                    friendlyName={pluginDict[key].friendly_name} 
                                    description={pluginDict[key].description} 
                                    home={pluginDict[key].home} 
                                    modules={pluginDict[key].modules} 
                                    
                                    
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
                                    
                                    />
                                    ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            
            
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