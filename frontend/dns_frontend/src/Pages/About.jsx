import React from "react";
import AboutMe from "../Components/AboutMe/AboutMe";
import MainBox from "../Components/MainBox";
import Seth from "../images/SethHS.jpg";
import Aankit from "../images/AankitHS.JPG";

const About = () => {
  return (
    <MainBox title={"About"}>
      <div style={{ overflow: "auto" }}>
        <AboutMe
          memberName={"Seth Warren"}
          attributes={["Team Lead", "Backend", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University planning on pursuing my Masters in Computer Science. In the MoDNS project, I worked on the backend API to facilitate communication between the framework and website."
          }
          image={Seth}
          imageleft={true}
        />
        <AboutMe
          memberName={"Bronson Jordan"}
          attributes={["Backend", "Cyber Engineering"]}
          description={""}
          image={""}
          imageleft={false}
        />
        <AboutMe
          memberName={"Carter Ray"}
          attributes={["Frontend", "Cyber Engineering"]}
          description={""}
          image={""}
          imageleft={true}
        />
        <AboutMe
          memberName={"Aankit Pokhrel"}
          attributes={["Frontend", "Cyber Engineering"]}
          description={
            "I am a Senior Cyber Engineering student attending Louisiana Tech University planning on graduating in May, and joining the workforce. In the MoDNS project, I worked on the frontend to allow users to more easily manage the DNS server."
          }
          image={Aankit}
          imageleft={false}
        />
        <AboutMe
          memberName={"Timothy Huhn"}
          attributes={["DevOps", "Cyber Engineering"]}
          description={""}
          image={""}
          imageleft={true}
        />
      </div>
    </MainBox>
  );
};

export default About;
