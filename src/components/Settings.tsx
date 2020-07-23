import React, { CSSProperties, useEffect, useState, useRef } from "react";
import Select, { components } from "react-select";
import { nodeInfo, pair, LeafletLatLng } from "../types";
import { ValueType } from "react-select/src/types";
import styled from "styled-components";

// import "./App.css";
const cities: Array<pair> = [
  { value: "san_francisco", label: "San Francisco" },
  { value: "new_york", label: "New York" },
  { value: "vancouver", label: "Vancouver" },
  { value: "waterloo", label: "Waterloo" },
];

const algos: Array<pair> = [
  { value: "dijkstas", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "greedy", label: "Best First Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
];

interface Props {
  startNode: string | null;
  endNode: string | null;
  runPathfindingHandler: () => void;
  algorithm: ValueType<pair>;
  setAlgorithm: (algorithm: ValueType<pair>) => void;
}

const SettingsContainer = styled("div")`
  position: absolute;
  width: 200px;
  padding: 30px;
  top: 10px;
  left: 10px;
  z-index: 9999;
  box-shadow: 0 0 6px 0 rgba(32, 32, 36, 0.18);
  background: #fff;
`;

const Setting = styled.div`
  padding-bottom: 20px;
`;

const Button = styled.button`
  width: 100%;
  cursor: pointer;
  background-color: ${(props) => (props.disabled ? "#e8e8e8" : "#333")};
  padding: 0.85rem 1.85rem;
  color: ${(props) => (props.disabled ? "#c7c7c7" : "white")};
  border: 0;
  font-size: 16px;
  font-weight: bold;
`;

const Label = styled.p`
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  margin-block-start: 0;
  margin-block-end: 5px;
`;

const extendTheme = (theme: any) => {
  return {
    ...theme,
    borderRadius: 0,
    colors: {
      ...theme.colors,
      primary: "#333",
    },
  };
};

const Settings: React.FC<Props> = ({
  startNode,
  endNode,
  runPathfindingHandler,
  algorithm,
  setAlgorithm,
}) => {
  const [city, setCity] = useState<ValueType<pair>>({
    value: "san_francisco",
    label: "San Francisco",
  });

  return (
    <SettingsContainer>
      <Setting>
        <Label>city</Label>
        <Select
          value={city}
          onChange={setCity}
          options={cities}
          theme={extendTheme}
        />
      </Setting>

      <Setting>
        <Label>algorithm</Label>
        <Select
          value={algorithm}
          onChange={setAlgorithm}
          options={algos}
          theme={extendTheme}
        />
      </Setting>

      {(!startNode || !endNode) && (
        <p style={{ textAlign: "center" }}>
          Click anywhere to set {!startNode ? "starting" : "ending"} point
        </p>
      )}

      <Button disabled={!startNode || !endNode} onClick={runPathfindingHandler}>
        Visualize
      </Button>
    </SettingsContainer>
  );
};

export default Settings;
