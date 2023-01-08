import { Box, Button } from "@mui/material";
import React from "react";
import Title from "./Title";
import { useState } from 'react';
import DropDownButtonImg from './Images/DropDownButton.png'
import DropDownButtonImgInverted from './Images/DropDownButtonInverted.png'

const DropDown = ({ children, sx, title, divider, titleCentered }) => {
        
    const [box, setBox] = useState(0);
    const [hei, setHei] = useState(0);
    const [imgUsed, setImgUsed] = useState(0);

    const pages = {
        0: 'visible',
        1: 'hidden',
    }

    const heig = {
        0:'auto',
        1: '0',
    }

    const buttonImg = {
        0: DropDownButtonImgInverted,
        1: DropDownButtonImg,
    }

    function hideChild(){
        // console.log(pages[box]);
        if(box === 0){
            setBox(1);
            setHei(1);
            setImgUsed(1);
        }
        else{
            setBox(0);
            setHei(0);
            setImgUsed(0);
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
                    <img src={buttonImg[imgUsed]} alt="Press"></img>
                </Button>
            </div>

            <div 
                id="menu-dropdown" 
                style={{ 
                    visibility : pages[box],
                    height: heig[hei],
                }}>
                {children}
            </div>
        </Box>
    );
};

export default DropDown;
