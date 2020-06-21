import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { LeafletMouseEvent, Icon } from "leaflet";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { ValueType } from "react-select/src/types";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import Settings from "./components/Settings";
import { nodeInfo, qtNode, pair } from "./types";
import { hasKey } from "./utils";
import * as d3 from "d3-quadtree";

import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);

  const [qt, setQt] = useState<d3.Quadtree<qtNode>>(d3.quadtree<qtNode>());

  useEffect(() => {
    // when node data is changed, build quadtree from nodes
    // this allows us to find closest node to a coord in O(log n) time

    // we need to format data to store it as a node in quadtree
    // don't include children/adj since we can always do O(1) lookup from nodeData
    // original: { x, y }
    // new: { nodeId, x, y }

    const transformed = [];
    for (let [key, value] of Object.entries(nodeData)) {
      transformed.push({ key: key, lat: value.lat, lon: value.lon });
    }

    setQt(
      qt
        .x((d: qtNode) => {
          return d.lat;
        })
        .y((d: qtNode) => {
          return d.lon;
        })
        .addAll(transformed)
    );
  }, [nodeData]);

  const icon = new Icon({
    iconUrl: "/marker.svg",
    iconSize: [32, 32],
  });

  const handleClick = (e: LeafletMouseEvent) => {
    console.log(qt.size());
    if (qt.size() > 0 && (!startNode || !endNode)) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const closest = qt.find(lat, lon);
      if (closest) {
        if (!startNode) {
          setStartNode(closest.key);
        } else {
          setEndNode(closest.key);
        }
      }
    }
  };

  const renderMarkers = () => {
    let markers = [];
    if (startNode && hasKey(nodeData, startNode)) {
      let node: nodeInfo = nodeData[startNode];
      markers.push(<Marker position={[node.lat, node.lon]} icon={icon} />);
    }
    if (endNode && hasKey(nodeData, endNode)) {
      let node: nodeInfo = nodeData[endNode];
      markers.push(<Marker position={[node.lat, node.lon]} icon={icon} />);
    }
    return markers;
  };

  return (
    <div className="App">
      <Settings startNode={startNode} endNode={endNode} />
      <Map
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        onClick={handleClick}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />
        {renderMarkers()}
      </Map>
    </div>
  );
};
export default App;
