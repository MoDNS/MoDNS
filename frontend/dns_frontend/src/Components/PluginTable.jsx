import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { PropTypes } from 'prop-types';
import { useRef } from 'react';

const PluginTable = ({ pluginStates, dragNDrop, rowList, setRowLists, listType, togglePlugin, numInterceptors, interceptorOrderDict }) => {

    const dragItem = useRef();
    const dragOverItem = useRef();

    const dragStart = (position) => {
        dragItem.current = position;
      };
    
      const dragEnter = (position) => {
        dragOverItem.current = position;
      };
    
      const dragDrop = () => {
        setRowLists(listType, dragItem.current, dragOverItem.current);
      };

    return (
        <div>
            <TableContainer >
                <Table >
                    <TableBody >
                        {
                            rowList && rowList.map((plugin, index) => (
                                <PluginTableRow 
                                    key={index} 
                                    // plugin elements
                                    uuid={plugin.uuid} 
                                    friendlyName={plugin.friendlyName} 
                                    description={plugin.description} 
                                    home={plugin.home} 
                                    modules={plugin.modules} 
                                    interceptPosition={ plugin.uuid in interceptorOrderDict ? interceptorOrderDict[plugin.uuid] : null}
                                    
                                    pluginState={pluginStates[plugin.uuid]}         // plugin state dict decoded into state for this individual plugin
                                    togglePlugin={togglePlugin}                     // toggle plugin function passed down

                                    dragNDrop={dragNDrop}                           // enables dragging and dropping of rows
                                    index={index}
                                    dragStart={dragStart}
                                    dragEnter={dragEnter}
                                    dragDrop={dragDrop}

                                    rowList={rowList}
                                    setRowLists={setRowLists}

                                    numInterceptors={numInterceptors}
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
    pluginList: PropTypes.array,
    dragNDrop: PropTypes.bool,
    onlyOneEnabled: PropTypes.bool,
};

PluginTable.defaultProps = {
    pluginList: [],
    dragNDrop: false,
    onlyOneEnabled: false,
};