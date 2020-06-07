import React, { useEffect, useState, useRef } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import locations from "../data/locations.json";

// import "./App.css";
const cities = [
  { value: "san_francisco", label: "San Francisco" },
  { value: "vancouver", label: "Vancouver" },
  { value: "waterloo", label: "Waterloo" },
];

const algos = [
  { value: "dijkstas", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "greedy", label: "Best First Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
];

const extendTheme = (theme) => {
  return {
    ...theme,
    borderRadius: 0,
    colors: {
      ...theme.colors,
      primary: "#333",
    },
  };
};

function Settings() {
  const [city, setCity] = useState({
    value: "san_francisco",
    label: "San Francisco",
  });

  const [algorithm, setAlgorithm] = useState({
    value: "dijkstas",
    label: "Dijkstra's Algorithm",
  });

  const [startNode, setStartNode] = useState({
    value: "",
    lable: "Loading...",
  });

  const [endNode, setEndNode] = useState({
    value: "",
    lable: "Loading...",
  });

  const loadNodes = (inputVal, callback) => {
    if (locations[city.value]) {
      setStartNode(locations[city.value][0]);
      setEndNode(locations[city.value][1]);
      callback(locations[city.value]);
    }
  };

  const handleCityChange = (newCity) => {
    setCity(newCity);
  };

  const handleAlgorithmChange = (newAlgo) => {
    setAlgorithm(newAlgo);
  };

  const handleStartNodeChange = (newStartNode) => {
    setStartNode(newStartNode);
  };

  const handleEndNodeChange = (newEndNode) => {
    setEndNode(newEndNode);
  };

  return (
    <div className="settings" style={styles.settings}>
      <div style={styles.setting}>
        <p style={styles.label}>city</p>
        <Select
          value={city}
          onChange={handleCityChange}
          options={cities}
          theme={extendTheme}
        />
      </div>

      <div style={styles.setting}>
        <p style={styles.label}>algorithm</p>
        <Select
          value={algorithm}
          onChange={handleAlgorithmChange}
          options={algos}
          theme={extendTheme}
        />
      </div>

      <div style={styles.setting}>
        <p style={styles.label}>start</p>
        <AsyncSelect
          value={startNode}
          onChange={handleStartNodeChange}
          cacheOptions
          loadOptions={loadNodes}
          defaultOptions
          theme={extendTheme}
        />
      </div>

      <div style={styles.setting}>
        <p style={styles.label}>end</p>
        <AsyncSelect
          value={endNode}
          onChange={handleEndNodeChange}
          cacheOptions
          loadOptions={loadNodes}
          defaultOptions
          theme={extendTheme}
        />
      </div>

      <button style={styles.button}>Visualize</button>
    </div>
  );
}

const styles = {
  settings: {
    position: "absolute",
    width: 200,
    padding: 30,
    top: 10,
    left: 10,
    zIndex: 9999,
    boxShadow: "0 0 6px 0 rgba(32, 32, 36, 0.18)",
    background: "#FFF",
  },
  setting: {
    paddingBottom: 20,
  },
  button: {
    width: "100%",
    cursor: "pointer",
    backgroundColor: "#333",
    padding: "0.85rem 1.85rem",
    color: "white",
    border: 0,
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBlockStart: 0,
    marginBlockEnd: 5,
  },
};

export default Settings;
