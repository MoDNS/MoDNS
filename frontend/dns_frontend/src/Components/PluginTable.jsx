import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { PropTypes } from 'prop-types';

const PluginTable = ({ pluginList, togglePlugin, pluginStates, dragNDrop, onlyOneEnabled }) => {
    return (
        <div>
            <TableContainer >
                <Table >
                    <TableBody >
                        {
                            // map the plugins in the given list to a row containing
                            pluginList.map((plugin, index) => (
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
                                    togglePlugin={togglePlugin}                     // toggle plugin function passed down

                                    dragNDrop={dragNDrop}                                       // enables dragging and dropping of rows

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