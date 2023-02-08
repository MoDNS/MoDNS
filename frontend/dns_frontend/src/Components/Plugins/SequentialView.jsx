import { Button } from '@mui/material';
import React from 'react';
import DropDown from '../DropDown';
import PluginTable from '../PluginTable';

import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useState } from 'react';

const SequentialView = ({ togglePlugin, pluginStates, pluginLists, setPluginLists, numInterceptors, interceptorOrderDict }) => {


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
                        togglePlugin={togglePlugin}         // toggle plugin function passed down
                        pluginStates={pluginStates}         // plugin state dict passed down
                        pluginList={pluginLists['listener']}
                        setPluginLists={setPluginLists}
                        listType={'listener'}
                        numInterceptors={numInterceptors}
                        interceptorOrderDict={interceptorOrderDict}
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
                        pluginStates={pluginStates}         // plugin state dict passed down
                        togglePlugin={togglePlugin}         // toggle plugin function passed down
                        dragNDrop                           // enables drag and drop rows
                        pluginList={pluginLists['interceptor']}
                        setPluginLists={setPluginLists}
                        listType={'interceptor'}
                        numInterceptors={numInterceptors}
                        interceptorOrderDict={interceptorOrderDict}

                    />
                </DropDown>

                <DropDown x={2} 
                    expanded={expanded[2]} 
                    toggleSelf={toggleSelf} 
                    title={"Resolvers"} 
                    description={"Resolves a Request by Querying external DNS Server"} 
                >
                    <PluginTable 
                        togglePlugin={togglePlugin}         // toggle plugin function passed down
                        pluginStates={pluginStates}         // plugin states dict passed down
                        pluginList={pluginLists['resolver']}
                        setPluginLists={setPluginLists}
                        listType={'resolver'}
                        numInterceptors={numInterceptors}
                        interceptorOrderDict={interceptorOrderDict}

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
                        pluginStates={pluginStates}         // plugin states dict passed down
                        togglePlugin={togglePlugin}         // toggle plugin function passed down
                        pluginList={pluginLists['validator']}
                        setPluginLists={setPluginLists}
                        listType={'validator'}
                        numInterceptors={numInterceptors}
                        interceptorOrderDict={interceptorOrderDict}

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
                        pluginStates={pluginStates}         // plugin states dict passed down
                        togglePlugin={togglePlugin}         // toggle plugin function passed down
                        pluginList={pluginLists['inspector']}
                        setPluginLists={setPluginLists}
                        listType={'inspector'}
                        numInterceptors={numInterceptors}
                        interceptorOrderDict={interceptorOrderDict}

                    />
                </DropDown>

            </div>
        </>
    );
};

export default SequentialView;