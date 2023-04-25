import React from "react";
import { useState, useEffect } from "react";
import MainBox from "../Components/MainBox";
import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";
import Markdown from "markdown-to-jsx";

const About = () => {
  const theme = useTheme();

  const [post, setPost] = useState("");
  useEffect(() => {
    import("../Components/README.md")
      .then((res) => {
        fetch(res.default)
          .then((res) => res.text())
          .then((res) => setPost(res))
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });

  return (
    <MainBox title={"About"} divider>
      <div
        style={{
          overflow: "auto",
          paddingLeft: 20,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Repo Link */}
        <Button
          variant="text"
          sx={{
            marginRight: 4,
            height: 50,
            width: "fit-content",
            fontSize: 30,
          }}
          href="https://github.com/MoDNS/MoDNS"
          target="_blank"
        >
          GitHub Repo
        </Button>
        {/* Docs Link */}
        <Button
          variant="text"
          sx={{
            marginRight: 4,
            height: 50,
            width: "fit-content",
            fontSize: 30,
          }}
          href="https://github.com/MoDNS/MoDNS/blob/main/docs/API.md"
          target="_blank"
        >
          API Documentation
        </Button>
        <Button
          variant="text"
          sx={{
            marginRight: 4,
            height: 50,
            width: "fit-content",
            fontSize: 30,
          }}
          href="https://github.com/MoDNS/MoDNS/blob/main/docs/plugins.md"
          target="_blank"
        >
          Plugin Documentation
        </Button>
        {/* ReadMe */}
        <span style={{ color: theme.palette.text.main }}>
          <Markdown>{post}</Markdown>
        </span>
      </div>
    </MainBox>
  );
};

export default About;
