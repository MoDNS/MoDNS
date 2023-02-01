import { Button } from '@mui/material';
import React from 'react';
import DropDown from '../DropDown';
import PluginTable from '../PluginTable';

import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { useState } from 'react';

const SequentialView = ({ pluginList, listenerList, interceptorList, resolverList, validatorList, inspectorList }) => {

    //////////////// Plugin Enabled Dict ////////////////
    let enabledNess = {}
    pluginList.forEach((plugin) => {
        enabledNess[plugin.uuid] = plugin.enabled;
    });

    const [pluginState, setPluginState] = useState(enabledNess);

    const togglePlugin = (uuid) => {
        let dict = pluginState;
        dict[uuid] = !dict[uuid];
        setPluginState({...dict});
    }

    //////////////// Accordion Expansion ////////////////
    const [expanded, setExpanded] = useState([false, false, false, false, false]);

    let accordionList = [];
    const toggleSelf = (x) => {
        accordionList = expanded;
        accordionList[x] = !accordionList[x];
        
        // I hate that this works
        setExpanded([...accordionList]);
    }

    const expandAll = () => {
        setExpanded([true, true, true, true, true]);
    }

    const collapseAll = () => {
        setExpanded([false, false, false, false, false]);
    }
    
    
    return (
        <div style={{ overflowY: 'auto',  margin: 10, marginRight: 0, }} >
            <Button
                variant='contained'
                sx={{marginRight: 2, }}
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
                

            <DropDown 
                x={0} 
                expanded={expanded[0]} 
                toggleSelf={toggleSelf} 
                title={"Listeners"} 
                description={"Receives DNS Queries"} 
            >
                <PluginTable pluginList={listenerList} togglePlugin={togglePlugin} pluginState={pluginState} onlyOneEnabled />
            </DropDown>

            <DropDown 
                x={1} 
                expanded={expanded[1]} 
                toggleSelf={toggleSelf} 
                title={"Interceptors"} 
                description={"Immediately Respond to or Drop Queries"} 
            >
                <PluginTable pluginList={interceptorList} togglePlugin={togglePlugin} pluginState={pluginState} dragNDrop />
            </DropDown>

            <DropDown x={2} 
                expanded={expanded[2]} 
                toggleSelf={toggleSelf} 
                title={"Resolvers"} 
                description={"Resolves a Request by Querying external DNS Server"} 
            >
                <PluginTable pluginList={resolverList} togglePlugin={togglePlugin} pluginState={pluginState} onlyOneEnabled />
            </DropDown>

            <DropDown 
                x={3} 
                expanded={expanded[3]} 
                toggleSelf={toggleSelf} 
                title={"Validators"} 
                description={"Validates the External DNS Responce"} 
            >
                <PluginTable pluginList={validatorList} togglePlugin={togglePlugin} pluginState={pluginState} />
            </DropDown>
            
            <DropDown 
                x={4} 
                expanded={expanded[4]} 
                toggleSelf={toggleSelf} 
                title={"Inspectors"} 
                description={"Views the Outbound Query and Response"} 
            >
                <PluginTable pluginList={inspectorList} togglePlugin={togglePlugin} pluginState={pluginState} />
            </DropDown>

        </div>
    );
};

export default SequentialView;