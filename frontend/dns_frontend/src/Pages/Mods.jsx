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
                style={{
                    display: "flex",
                    flexDirection: "column",
                    width: '100%'
                }}
            >
                <DropDown title={"Setting1"} sx={{}}>
                    <h1>Insert Items here</h1>
                </DropDown>

                <DropDown title={"Setting2"} sx={{}}>
                    <h1>Insert Items here</h1>
                    <h1>Insert Items here</h1>
                    <h1>Insert Items here</h1>
                </DropDown>
            </div>
        </MainBox>
    );
};

export default Mods;