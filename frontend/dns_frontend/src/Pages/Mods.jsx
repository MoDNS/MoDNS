import React from 'react';

import MainBox from '../Components/MainBox';
import DropDown from '../Components/DropDown';

const Mods = () => {
    return (
        <MainBox
            title={"Mods"}
            divider
        >
            <DropDown title={"Setting1"} sx={{}}>
            </DropDown>
        </MainBox>
    );
};

export default Mods;