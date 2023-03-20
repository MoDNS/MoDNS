import { Button } from '@mui/material';
import DropDown from '../DropDown';
import PluginTable from '../PluginTable';
import { useState } from 'react';
import { PropTypes } from 'prop-types';

import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

const SequentialView = ({ pluginDicts, numInterceptors, pluginsEnabledDict, togglePlugin, interceptorUuidOrder, setInterceptOrder }) => {

    //////////////// Accordion Expansion ////////////////
    const [expanded, setExpanded] = useState([false, false, false, false, false]);
    // toggle single accordion in state array
    const toggleSelf = (x) => {
        let accordionList = [];
        accordionList = expanded;
        accordionList[x] = !accordionList[x];
        
        // I hate that this works
        setExpanded([...accordionList]);
    }
    // expand all accordions
    const expandAll = () => {
        setExpanded([true, true, true, true, true]);
    }
    // collapse all accordions
    const collapseAll = () => {
        setExpanded([false, false, false, false, false]);
    }
    
    return (
        <>
            <div style={{ marginTop: 10 }}>
                <Button
                    variant='contained'
                    sx={{ marginRight: 2, }}
                    onClick={() => expandAll()}
                >
                    <KeyboardDoubleArrowDownIcon sx={{ marginRight: 1.5 }} />
                    Expand All
                </Button>
                <Button
                    variant='contained'
                    onClick={() => collapseAll()}
                >
                    <KeyboardDoubleArrowUpIcon sx={{ marginRight: 1.5 }} />
                    Collapse All
                </Button>
            </div>
            <div style={{ overflowY: 'auto',  margin: 10, marginRight: 0, height: '100%' }} >
                <DropDown 
                    x={0} 
                    expanded={expanded[0]}
                    toggleSelf={toggleSelf} 
                    title={"Listeners"} 
                    description={"Receives DNS Queries"} 
                >
                    <PluginTable 
                        pluginDict={pluginDicts['listener']}
                        numInterceptors={numInterceptors}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        module={'listener'}
                        
                    />
                </DropDown>

                <DropDown 
                    x={1} 
                    expanded={expanded[1]} 
                    toggleSelf={toggleSelf} 
                    title={"Interceptors"} 
                    description={"Immediately Respond to or Drop Queries"} 
                >
                    <PluginTable 
                        dragNDrop                           // enables drag and drop rows
                        pluginDict={pluginDicts['interceptor']}
                        numInterceptors={numInterceptors}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        module={'interceptor'}

                    />
                </DropDown>

                <DropDown x={2} 
                    expanded={expanded[2]} 
                    toggleSelf={toggleSelf} 
                    title={"Resolvers"} 
                    description={"Resolves a Request by Querying external DNS Server"} 
                >
                    <PluginTable 
                        pluginDict={pluginDicts['resolver']}
                        numInterceptors={numInterceptors}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        module={'resolver'}

                    />
                </DropDown>

                <DropDown 
                    x={3} 
                    expanded={expanded[3]} 
                    toggleSelf={toggleSelf} 
                    title={"Validators"} 
                    description={"Validates the External DNS Responce"} 
                >
                    <PluginTable 
                        pluginDict={pluginDicts['validator']}
                        numInterceptors={numInterceptors}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        module={'validator'}

                    />
                </DropDown>
                
                <DropDown 
                    x={4} 
                    expanded={expanded[4]} 
                    toggleSelf={toggleSelf} 
                    title={"Inspectors"} 
                    description={"Views the Outbound Query and Response"} 
                >
                    <PluginTable 
                        pluginDict={pluginDicts['inspector']}
                        numInterceptors={numInterceptors}
                        pluginsEnabledDict={pluginsEnabledDict}
                        togglePlugin={togglePlugin}
                        interceptorUuidOrder={interceptorUuidOrder}
                        setInterceptOrder={setInterceptOrder}
                        module={'inspector'}    

                    />
                </DropDown>

            </div>
        </>
    );
};

export default SequentialView;


SequentialView.propTypes = {
    pluginDicts: PropTypes.object.isRequired,               // Dictionary of Dictionaries. contains plugins under they key name of their module filters
    numInterceptors: PropTypes.number.isRequired,           // Total number of interceptors implemented
    pluginsEnabledDict: PropTypes.object.isRequired,        // Dictionary of what plugins are enabled
    togglePlugin: PropTypes.func.isRequired,                // Function to toggle a plugin
    interceptorUuidOrder: PropTypes.array.isRequired,       // Array for ordering interceptor plugins by uuid
    setInterceptOrder: PropTypes.func.isRequired,           // Change interceptor plugin order
};
