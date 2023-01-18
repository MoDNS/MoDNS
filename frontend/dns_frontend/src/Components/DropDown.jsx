import { Box, Button } from "@mui/material";
import React from "react";
import Title from "./Title";
import { useState } from "react";
import DropDownButtonImg from "./Images/DropDownButton.png";
import DropDownButtonImgInverted from "./Images/DropDownButtonInverted.png";

const DropDown = ({ children, sx, title, divider, titleCentered }) => {
  const Vis = ["visible", "auto", DropDownButtonImgInverted];
  const Hid = ["hidden", "0", DropDownButtonImg];

  const [box, setBox] = useState(0);

  const visibilityOfChildComponent = {
    0: Vis,
    1: Hid,
  };

  function hideChild() {
    if (box === 0) {
      setBox(1);
    } else {
      setBox(0);
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        width: "100%",
        overflow: "hidden",
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
        <Title titleCentered={titleCentered} divider={divider}>
          {title}
        </Title>

        <Button
          onClick={hideChild}
          sx={{
            width: 100,
          }}
        >
          <img src={visibilityOfChildComponent[box][2]} alt="Press"></img>
        </Button>
      </div>

      <div
        id="menu-dropdown"
        style={{
          visibility: visibilityOfChildComponent[box][0],
          height: visibilityOfChildComponent[box][1],
        }}
      >
        {children}
      </div>
    </Box>
  );
};

export default DropDown;
