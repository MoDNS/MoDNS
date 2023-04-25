import React from "react";
import AboutMe from "../Components/AboutMe/AboutMe";
import MainBox from "../Components/MainBox";
import Seth from "../images/SethHS.jpg";
import Aankit from "../images/AankitHS.JPG";
import Carter from "../images/CarterHS.jpg";
import Bronson from "../images/BronsonHS.jpg";

const About = () => {
  return (
    <MainBox title={"About"} divider >
      <div style={{ overflow: "auto" }}>
        <AboutMe
          memberName={"Seth Warren"}
          attributes={["Team Lead", "Backend", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University planning on pursuing my Masters in Computer Science. In the MoDNS project, I worked on the backend API to facilitate communication between the framework and website."
          }
          image={ Seth }
          imageleft={true}
        />
        <AboutMe
          memberName={"Bronson Jordan"}
          attributes={["Backend", "Cyber Engineering"]}
          description={
            "I am a Senior at Louisiana Tech studying Cyber Engineering. After graduating, I will start work as a Software Engineer for Praeses LLC. On the MoDNS project, I oversaw the plugin framework and SDK, which allows our server to interface with custom plugins."
          }
          image={Bronson}
          imageleft={false}
        />
        <AboutMe
          memberName={"Carter Ray"}
          attributes={["Frontend", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University graduating in May. In the MoDNS project, I worked on the frontend to allow users to more easily manage the DNS server."
          }
          image={ Carter }
          imageleft={true}
        />
        <AboutMe
          memberName={"Aankit Pokhrel"}
          attributes={["Frontend", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University graduating in May. After Graduationg I will start work at Pepsico. In the MoDNS project I worked on the frontend to allow users to more easily manage the DNS server."
          }
          image={ Aankit }
          imageleft={false}
        />
        <AboutMe
          memberName={"Timothy Huhn"}
          attributes={["DevOps", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University graduating in May. In the MoDNS project, I worked on the development environment to allow the backend and frontend teams to more efficiently develop MoDNS."
          }
          image={""}
          imageleft={true}
        />
      </div>
    </MainBox>
  );
};

export default About;
