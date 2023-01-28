import React from 'react';
import DropDown from '../DropDown';
import ModTable from '../PluginTable';

const SequentialView = () => {
    return (
        <div style={{ overflowY: 'auto',  margin: 10, marginRight: 0, }} >
                
            <DropDown title={"Listeners"} description={"Receives DNS Queries"} >
                <ModTable type={"listeners"} />
            </DropDown>

            <DropDown title={"Interceptors"} description={"Immediately Respond to or Drop Queries"} >
                <ModTable type={"interceptors"} />
            </DropDown>

            <DropDown title={"Resolvers"} description={"Resolves a Request by Querying external DNS Server"} >
                <ModTable type={"resolvers"}/>
            </DropDown>

            <DropDown title={"Validators"} description={"Validates the External DNS Responce"} >
                <ModTable type={"validators"} />
            </DropDown>
            
            <DropDown title={"Inspectors"} description={"Views the Outbound Query and Response"} >
                <ModTable type={"inspectors"} />
            </DropDown>

        </div>
    );
};

export default SequentialView;