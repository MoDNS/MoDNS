import { Box, Button } from "@mui/material";
import React from "react";
import Title from "./Title";
import { useState } from 'react';
import DropDownButtonImg from './Images/DropDownButton.png'
import DropDownButtonImgInverted from './Images/DropDownButtonInverted.png'

const DropDown = ({ children, sx, title, divider, titleCentered }) => {
        
    const Vis = ['visible', 'auto', DropDownButtonImgInverted];
    const Hid = ['hidden', '0', DropDownButtonImg];

    const [box, setBox] = useState(0);

    const pages = {
        0: Vis,
        1: Hid,
    }

    function hideChild(){
        // console.log(pages[box]);
        if(box === 0){
            setBox(1);
        }
        else{
            setBox(0);
        }
    };

    return (
        <Box
            sx={{
            backgroundColor: "primary.main",
            width: "100%",
            overflow: "hidden",
            // border: "1px solid white",
            minheight: 100,
            ...sx,
            }}
        >
            <div
                style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                }}
            >
                <Title
                    titleCentered={titleCentered}
                    divider={divider}
                    sx={{
                    // padding: 2,
                    }}
                >
                    {title}
                </Title>

                <Button
                    onClick={ hideChild }
                    sx={{
                    width: 100,
                    }}
                >
                    <img src={pages[box][2]} alt="Press"></img>
                </Button>
            </div>

            <div 
                id="menu-dropdown" 
                style={{ 
                    visibility : pages[box][0],
                    height:  pages[box][1],
                }}>
                {children}
            </div>
        </Box>
    );
};

export default DropDown;
