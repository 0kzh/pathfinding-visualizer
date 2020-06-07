import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Icon } from "leaflet";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import { accessToken } from "./creds";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  const icon = new Icon({
    iconUrl: "/marker.svg",
    iconSize: [25, 25],
  });

  // console.log(nodeData["6597683646"]);
  return (
    <div className="App">
      <Settings />
      <Map center={[lat, lng]} zoom={zoom} zoomControl={false}>
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />

        {/* <Marker
          position={[, val.lat]}
          onClick={() => {
            // setActivePark(park);
          }}
          icon={icon}
        /> */}
        {/* {Object.keys(nodeData).map((key, index) => {
          const val = nodeData[key];

          if (index % 50 == 0 && val) {
            return (
              <Marker
                key={key}
                position={[val.lat, val.lon]}
                onClick={() => {
                  console.log(key);
                }}
                icon={icon}
              />
            );
          } else {
            return null;
          }
        })} */}
        {cities["san_francisco"].map((loc) => {
          const val = nodeData[loc.value];
          // console.log(val);
          return (
            <Marker
              key={loc.node}
              position={[val.lat, val.lon]}
              onClick={() => {
                console.log(loc.value);
              }}
              icon={icon}
            />
          );
        })}
      </Map>
    </div>
  );
}
export default App;
