import React from 'react';

import MainBox from '../Components/MainBox';
import DropDown from '../Components/DropDown';

const Mods = () => {
    return (
        <MainBox
            title={"Mods"}
            divider
        >
            <div
                sx={{
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <DropDown title={"Setting1"} sx={{}}>
                    <h1>banana is my name and i like being yellow</h1>
                    <h1>banana is my name and i like being yellow</h1>
                    <h1>banana is my name and i like being yellow</h1>
                </DropDown>

                <DropDown title={"Setting2"} sx={{}}>
                    <h1>banana is not my name and i like being yellow</h1>
                </DropDown>
            </div>
        </MainBox>
    );
};

export default Mods;