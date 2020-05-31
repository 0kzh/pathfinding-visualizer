import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import logo from "./logo.svg";
import { accessToken } from "./creds";
import "./App.css";

mapboxgl.accessToken = accessToken;

function App() {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  return (
    <div className="App">
      <Map center={[lat, lng]} zoom={zoom}>
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map>
    </div>
  );
}

export default App;
