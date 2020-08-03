import React, { useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import { Button } from "./Styles";
import { descriptions } from "../constants";

const Subtitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Description = styled.div`
  line-height: 1.5;
`;

const Tabs = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Tab = styled.div`
  cursor: pointer;
  padding: 8px 16px;
  font-size: 16px;
  text-transform: uppercase;
  text-decoration: underline;
`;

Modal.setAppElement("#root");

const Algorithm: React.FC<{ name: string; desc: string; tags: string }> = ({
  name,
  desc,
  tags,
}) => (
  <div style={{ marginBottom: 10 }}>
    <b>{name}: </b>
    {desc}
    <br />
    <i>{tags}</i>
  </div>
);

interface Props {
  darkMode: boolean;
  modalIsOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Tutorial: React.FC<Props> = ({ darkMode, modalIsOpen, setIsOpen }) => {
  const [tab, setTab] = useState("about");

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "50%",
      padding: 30,
      background: darkMode ? "#212121" : "white",
      color: darkMode ? "white" : "black",
      borderColor: darkMode ? "#353535" : "white",
    },
    overlay: {
      zIndex: 9999,
      backgroundColor: darkMode ? "rgba(0,0,0, 0.3)" : "rgba(255,255,255,0.4)",
    },
  };

  const About = () => (
    <div>
      <h2>Welcome to Maps Pathfinding Visualizer</h2>
      <Description>
        <Subtitle>What is this?</Subtitle>❓ This app visualizes graph
        pathfinding algorithms for real-time route-finding on a map.
      </Description>
      <Description>
        <Subtitle>How do I use it?</Subtitle>
        👉 Select an algorithm to visualize on the top-left corner.
        <br />
        🏘 Choose a city by clicking on the dropdown on the top-middle.
        <br />
        👀 When you're ready, click "Visualize" to see the algorithm in action
      </Description>
    </div>
  );

  const Algorithms = () => (
    <div>
      <h2>About the Algorithms</h2>
      <Description>
        {descriptions.map((algo) => (
          <Algorithm
            key={algo.name}
            name={algo.name}
            desc={algo.desc}
            tags={algo.tags}
          />
        ))}
      </Description>
    </div>
  );

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setIsOpen(false)}
      style={customStyles}
    >
      <Tabs>
        <Tab onClick={() => setTab("about")}>About</Tab>
        <Tab onClick={() => setTab("algorithms")}>Algorithms</Tab>
      </Tabs>
      {tab === "about" ? <About /> : <Algorithms />}
      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button onClick={() => setIsOpen(false)} style={{ marginTop: 20 }}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default Tutorial;
