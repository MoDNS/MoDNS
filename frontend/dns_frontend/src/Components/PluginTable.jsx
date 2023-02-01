import { Table, TableBody, TableContainer } from '@mui/material';
import PluginTableRow from './PluginTableRow';
import { PropTypes } from 'prop-types';


const PluginTable = ({ pluginList, dragNDrop, onlyOneEnabled }) => {

    return (
        <div>
            <TableContainer >
                <Table >
                    <TableBody >
                        {
                            pluginList.map((plugin, index) => (
                                <PluginTableRow 
                                    key={index} 

                                    uuid={plugin.uuid} 
                                    friendlyName={plugin.friendlyName} 
                                    description={plugin.description} 
                                    home={plugin.home} 
                                    modules={plugin.modules} 
                                    interceptPosition={plugin.interceptPosition} 
                                    enabled={plugin.enabled} 

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
    pluginList: PropTypes.object,
    dragNDrop: PropTypes.bool,
    onlyOneEnabled: PropTypes.bool,
};

PluginTable.defaultProps = {
    pluginList: {},
    dragNDrop: false,
    onlyOneEnabled: false,
};