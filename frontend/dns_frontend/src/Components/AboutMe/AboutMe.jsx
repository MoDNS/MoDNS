import React from "react";
import { PropTypes } from "prop-types";
// import MainBox from "../MainBox";

const AboutMe = ({ memberName, attributes, description, image, imageleft }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: imageleft ? "row" : "row-reverse",
        height: "400px",
      }}
    >
      <div
        style={{
          margin: "30px",
          height: "100%",
          width: "400px",
        }}
      >
        {/* image holder */}
        <img
          src={image}
          alt=""
          style={{
            height: "100%",
            width: "auto",
            borderRadius: "10%",
            marginLeft: imageleft ? "10px" : "0px",
            marginRight: imageleft ? "0px" : "10px",
          }}
        />
      </div>
      <div style={{ padding: "30px", justifyContent: "left" }}>
        {/* Description Holder */}
        <h1 style={{ fontSize: "55px" }}> {memberName} </h1>
        <p style={{ fontSize: "20px" }}>
          <b>Attributes:</b> {attributes.toString()}
        </p>
        <p style={{ fontSize: "20px" }}>
          <b>Description:</b> {description}
        </p>
      </div>
    </div>
  );
};

export default AboutMe;

AboutMe.propTypes = {
  memberName: PropTypes.string.isRequired,
  attributes: PropTypes.array.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.any,
  imageleft: PropTypes.bool.isRequired,
};
