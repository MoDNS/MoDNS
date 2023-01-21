import React from 'react';
import DropDown from '../DropDown';

const SequentialView = () => {
    return (
        <div style={{ overflowY: 'auto',  margin: 10 }} >
                
            <DropDown title={"Listeners"} description={"Receives DNS Queries"} >
                test item 1
            </DropDown>

            <DropDown title={"Interceptors"} description={"Immediately Respond to or Drop Queries"} >
                test item 2
            </DropDown>

            <DropDown title={"Resolvers"} description={"Resolves a Request by Querying external DNS Server"} >
                test item 3
            </DropDown>

            <DropDown title={"Validators"} description={"Validates the External DNS Responce"} >
                test item 4
            </DropDown>
            
            <DropDown title={"Inspectors"} description={"Views the Outbound Query and Response"} >
                test item 5
            </DropDown>

        </div>
    );
};

export default SequentialView;