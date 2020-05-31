import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import logo from "./logo.svg";
import { accessToken } from "./creds";
import "./App.css";

mapboxgl.accessToken = accessToken;

function App() {
  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(2);

  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
  });
  return (
    <div className="App">
      <div className="mapContainer" ref={mapContainer}></div>
    </div>
  );
}

export default App;
