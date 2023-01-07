import { Box, Button } from "@mui/material";
import React from "react";
import Title from "./Title";

const DropDown = ({ children, sx, title, divider, titleCentered }) => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        // padding: 6,
        // paddingTop: 4,
        width: "100%",
        overflow: "hidden",
        border: "1px solid white",
        height: 100,
        display: "flex",
        flexDirection: "row",
        ...sx,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width:'100%'
        }}
      >
        <Title
          titleCentered={titleCentered}
          divider={divider}
          sx={{
            padding: 2,
          }}
        >
          {title}
        </Title>

        <Button
          sx={{
            width: 100,
          }}
        >
          <img src="./Images/DropDownButton.png" alt="Press"></img>
        </Button>
      </div>
      <div>{children}</div>
    </Box>
  );
};

export default DropDown;
