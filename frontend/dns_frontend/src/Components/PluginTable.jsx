import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { PropTypes } from 'prop-types';
import { useRef } from 'react';

const PluginTable = ({ pluginStates, togglePlugin, dragNDrop, pluginList, setPluginLists, listType, numInterceptors, interceptorOrderDict }) => {

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
        setPluginLists(listType, dragItem.current, dragOverItem.current);
      };

    return (
        <div>
            <TableContainer >
                <Table >
                    <TableBody >
                        {
                            pluginList && pluginList.map((plugin, index) => (
                                <PluginTableRow 
                                    key={index} 
                                    // plugin elements
                                    uuid={plugin.uuid} 
                                    friendlyName={plugin.friendly_name} 
                                    description={plugin.description} 
                                    home={plugin.home} 
                                    modules={plugin.modules} 
                                    interceptPosition={ plugin.uuid in interceptorOrderDict ? interceptorOrderDict[plugin.uuid] : null}
                                    numInterceptors={numInterceptors}
                                    
                                    pluginState={pluginStates[plugin.uuid]}         // plugin state dict decoded into state for this individual plugin
                                    togglePlugin={togglePlugin}                     // toggle plugin function passed down

                                    dragNDrop={dragNDrop}                           // enables dragging and dropping of rows
                                    index={index}
                                    dragStart={dragStart}
                                    dragEnter={dragEnter}
                                    dragDrop={dragDrop}

                                    setPluginLists={setPluginLists}

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
    pluginStates: PropTypes.object.isRequired,          // enabled / disabled state of plugin
    togglePlugin: PropTypes.func.isRequired,            // function to enable / disable a plugin
    dragNDrop: PropTypes.bool,                          // if table should implement Drag and Drop Features
    pluginList: PropTypes.array.isRequired,             // list of plugins to display
    setPluginLists: PropTypes.func.isRequired,          // function to change the order displayed in the table
    listType: PropTypes.string.isRequired,              // what type of modules are in this table
    numInterceptors: PropTypes.number,                  // total number of interceptor plugins installed
    interceptorOrderDict: PropTypes.object.isRequired,  // dictionary of intercept order based on uuid
};

PluginTable.defaultProps = {
    dragNDrop: false,                                   // table allows drag n drop or not, default no
};