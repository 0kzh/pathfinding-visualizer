import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  flex-align: center;
  justify-content: center;
`;

const Text = styled.h1`
  font-size: 24px;
  display: flex;
  flex-align: center;
  justify-content: center;
  align-items: center;
  font-weight: 400;
`;

interface Props {
  darkMode: boolean;
  progress: number;
}

const Loading: React.FC<Props> = ({ darkMode, progress }) => {
  const customStyles = {
    backgroundColor: darkMode ? "#090909" : "#FBF8F3",
    color: darkMode ? "white" : "black",
  };

  return (
    <Container style={customStyles}>
      <Text>Loading city data... {progress}%</Text>
    </Container>
  );
};

export default Loading;
