import React, { CSSProperties, useEffect, useState, useRef } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import locations from "../data/locations.json";
import CSS from "csstype";
import { nodeInfo, pair } from "../types";
import { ValueType } from "react-select/src/types";
import { hasKey } from "../utils";
import styled from "styled-components";

// import "./App.css";
const cities: Array<pair> = [
  { value: "san_francisco", label: "San Francisco" },
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

const Setting = styled("div")`
  padding-bottom: 20px;
`;

const Button = styled("button")`
  width: 100%;
  cursor: pointer;
  background-color: #333;
  padding: 0.85rem 1.85rem;
  color: white;
  border: 0;
  font-size: 16px;
  font-weight: bold;
`;

const Label = styled("p")`
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

const Settings: React.FC<{}> = () => {
  const [city, setCity] = useState<ValueType<pair>>({
    value: "san_francisco",
    label: "San Francisco",
  });

  const [algorithm, setAlgorithm] = useState<ValueType<pair>>({
    value: "dijkstas",
    label: "Dijkstra's Algorithm",
  });

  const [startNode, setStartNode] = useState<ValueType<pair>>({
    value: "",
    label: "Loading...",
  });

  const [endNode, setEndNode] = useState<ValueType<pair>>({
    value: "",
    label: "Loading...",
  });

  const loadNodes = (inputVal: any, callback: (res: Array<pair>) => void) => {
    const p = city as pair;
    if (hasKey(locations, p.value)) {
      setStartNode(locations[p.value][0]);
      setEndNode(locations[p.value][1]);
      callback(locations[p.value]);
    }
  };

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

      <Setting>
        <Label>start</Label>
        <AsyncSelect
          value={startNode}
          onChange={setStartNode}
          cacheOptions
          loadOptions={loadNodes}
          defaultOptions
          theme={extendTheme}
        />
      </Setting>

      <Setting>
        <Label>end</Label>
        <AsyncSelect
          value={endNode}
          onChange={setEndNode}
          cacheOptions
          loadOptions={loadNodes}
          defaultOptions
          theme={extendTheme}
        />
      </Setting>

      <Button>Visualize</Button>
    </SettingsContainer>
  );
};

export default Settings;
