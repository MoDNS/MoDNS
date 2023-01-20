// import { Button } from "@mui/material";
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
    <div
      onClick={hideChild} //when the entire
      sx={{
        backgroundColor: "primary.main",
        width: "100%",
        overflow: "hidden",
        minheight: 100,
        padding: 20,
        paddingTop: 0,
        ...sx,
      }}
    >
      {/* This is the div that is used to hold the dropdown title and image */}
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

        <div>
          <img
            src={visibilityOfChildComponent[box][2]}
            style={{
              width: "auto",
              height: "auto",
              margin: 15,
            }}
            alt="Press"
          />
        </div>
      </div>

      {/* This is the div that holds the actual items from the dropdown */}
      <div
        id="menu-dropdown"
        style={{
          visibility: visibilityOfChildComponent[box][0],
          height: visibilityOfChildComponent[box][1],
          padding: 20,
          paddingTop: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DropDown;
