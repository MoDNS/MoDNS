import React from "react";
import { useState, useEffect } from "react";
import MainBox from "../Components/MainBox";
import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";
import Markdown from "markdown-to-jsx";

const About = () => {
  const theme = useTheme();

  const [post, setPost] = useState("");

  var ReadMe = "./Docs/README.md";
  var APIDocs = "./Docs/API.md";
  var PluginDocs = "./Docs/plugins.md";

  var view = ReadMe;

  function ChooseDocs(docName) {
    view = docName;
    console.log(view);
  }

  useEffect(() => {
    import(view)
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
        <div style={{ flexDirection: "row" }}>
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
          {/* ReadME */}
          <Button
            variant="text"
            sx={{
              marginRight: 4,
              height: 50,
              width: "fit-content",
              fontSize: 30,
            }}
            // href="https://github.com/MoDNS/MoDNS"
            target="_blank"
            onClick={ChooseDocs(ReadMe)}
          >
            ReadMe
          </Button>
          <Button
            variant="text"
            sx={{
              marginRight: 4,
              height: 50,
              width: "fit-content",
              fontSize: 30,
            }}
            // href="https://github.com/MoDNS/MoDNS/blob/main/docs/API.md"
            target="_blank"
            onClick={ChooseDocs(APIDocs)}
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
            // href="https://github.com/MoDNS/MoDNS/blob/main/docs/plugins.md"
            target="_blank"
            onClick={ChooseDocs(PluginDocs)}
          >
            Plugin Documentation
          </Button>
        </div>
        {/* ReadMe */}
        <span style={{ color: theme.palette.text.main }}>
          <Markdown>{post}</Markdown>
        </span>
      </div>
    </MainBox>
  );
};

export default About;
