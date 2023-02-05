import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { PropTypes } from 'prop-types';
import { useRef } from 'react';

const PluginTable = ({ pluginStates, dragNDrop, rowList, setRowList, listType, togglePlugin }) => {

    const dragItem = useRef();
    const dragOverItem = useRef();

    const dragStart = (e, position) => {
        dragItem.current = position;
      };
    
      const dragEnter = (e, position) => {
        dragOverItem.current = position;
      };
    
      const dragDrop = (e) => {
        const copyListItems = [...rowList];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setRowList(listType, copyListItems);
      };

      const enablePluginMidCheck = (uuid) => {
        togglePlugin(uuid, listType);
      }

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
                                    interceptPosition={plugin.interceptPosition} 
                                    
                                    pluginState={pluginStates[plugin.uuid]}         // plugin state dict decoded into state for this individual plugin
                                    togglePlugin={enablePluginMidCheck}                     // toggle plugin function passed down

                                    dragNDrop={dragNDrop}                           // enables dragging and dropping of rows
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
    pluginList: PropTypes.array,
    dragNDrop: PropTypes.bool,
    onlyOneEnabled: PropTypes.bool,
};

PluginTable.defaultProps = {
    pluginList: [],
    dragNDrop: false,
    onlyOneEnabled: false,
};