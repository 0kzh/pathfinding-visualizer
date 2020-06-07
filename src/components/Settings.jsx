import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";

// import "./App.css";
const locations = [
  { value: "sanfran", label: "San Francisco" },
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
      primary: "black",
    },
  };
};

function Settings() {
  const [location, setLocation] = useState({
    value: "sanfran",
    label: "San Francisco",
  });

  const [algorithm, setAlgorithm] = useState({
    value: "dijkstas",
    label: "Dijkstra's Algorithm",
  });

  const handleLocationChange = (newLoc) => {
    setLocation(newLoc);
  };

  const handleAlgorithmChange = (newAlgo) => {
    setAlgorithm(newAlgo);
  };

  return (
    <div className="settings" style={styles.settings}>
      <div style={styles.setting}>
        <p style={styles.label}>location</p>
        <Select
          value={location}
          onChange={handleLocationChange}
          options={locations}
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
        <Select
          value={algorithm}
          onChange={handleAlgorithmChange}
          options={algos}
          theme={extendTheme}
        />
      </div>

      <div style={styles.setting}>
        <p style={styles.label}>end</p>
        <Select
          value={algorithm}
          onChange={handleAlgorithmChange}
          options={algos}
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
    backgroundColor: "black",
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
