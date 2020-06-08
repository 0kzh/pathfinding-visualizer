import React, { CSSProperties, useEffect, useState, useRef } from "react";
import AsyncSelect from "react-select/async";
import Select, { components } from "react-select";
import locations from "../data/locations.json";
import CSS from "csstype";
import { nodeInfo, pair } from "../types";
import { SelectComponents } from "react-select/src/components";
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

interface Props {
  startNode: ValueType<pair>;
  endNode: ValueType<pair>;
  setStartNodeHandler: (node: ValueType<pair>) => void;
  setEndNodeHandler: (node: ValueType<pair>) => void;
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

const Settings: React.FC<Props> = ({
  startNode,
  endNode,
  setStartNodeHandler,
  setEndNodeHandler,
}) => {
  const [city, setCity] = useState<ValueType<pair>>({
    value: "san_francisco",
    label: "San Francisco",
  });

  const [algorithm, setAlgorithm] = useState<ValueType<pair>>({
    value: "dijkstas",
    label: "Dijkstra's Algorithm",
  });

  const loadNodes = (inputVal: any, callback: (res: Array<pair>) => void) => {
    const p = city as pair;
    if (hasKey(locations, p.value)) {
      setStartNodeHandler(locations[p.value][0]);
      setEndNodeHandler(locations[p.value][1]);
      callback(locations[p.value]);
    }
  };

  const Option = (props: any) => {
    return (
      <div
        onMouseEnter={() => {
          if (props.selectProps.isStart) {
            setStartNodeHandler(props.data);
          } else {
            setEndNodeHandler(props.data);
          }
        }}
      >
        <components.Option {...props} />
      </div>
    );
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
          isStart
          components={{ Option }}
          onChange={setStartNodeHandler}
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
          components={{ Option }}
          onChange={setEndNodeHandler}
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
