import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Icon } from "leaflet";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { ValueType } from "react-select/src/types";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import Settings from "./components/Settings";
import { nodeInfo, pair } from "./types";
import { hasKey } from "./utils";
import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  const [startNode, setStartNode] = useState<ValueType<pair> | null>(null);
  const [endNode, setEndNode] = useState<ValueType<pair> | null>(null);

  const icon = new Icon({
    iconUrl: "/marker.svg",
    iconSize: [20, 20],
  });

  const activeIcon = new Icon({
    iconUrl: "/pin.svg",
    iconSize: [24, 24],
  });

  const getMarker = (key: string) => {
    const start = startNode as pair;
    const end = endNode as pair;
    if (start && end && (start.value == key || end.value == key)) {
      return activeIcon;
    }
    return icon;
  };

  // console.log(nodeData["6597683646"]);
  return (
    <div className="App">
      <Settings
        startNode={startNode}
        endNode={endNode}
        setStartNodeHandler={setStartNode}
        setEndNodeHandler={setEndNode}
      />
      <Map center={[lat, lng]} zoom={zoom} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />
        {cities["san_francisco"].map((loc: pair) => {
          if (hasKey(nodeData, loc.value)) {
            const val: nodeInfo = nodeData[loc.value];
            return (
              <Marker
                key={loc.value}
                position={[val.lat, val.lon]}
                onClick={() => {
                  console.log(loc.value);
                }}
                icon={getMarker(loc.value)}
              />
            );
          }
        })}
      </Map>
    </div>
  );
};
export default App;
