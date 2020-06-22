import React, { useEffect, useState, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import { LeafletEvent, LeafletMouseEvent, Icon } from "leaflet";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import { ValueType } from "react-select/src/types";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import Settings from "./components/Settings";
import { nodeInfo, qtNode, LeafletLatLng } from "./types";
import { hasKey } from "./utils";
import { marker } from "./Icons";
import * as d3 from "d3-quadtree";

import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  const [startNode, setStartNode] = useState<string | null>("258968250");
  const [endNode, setEndNode] = useState<string | null>("65296327");
  const startNodeMarker = useRef<Marker>(null);
  const endNodeMarker = useRef<Marker>(null);

  const [startMarkerPos, setStartMarkerPos] = useState<LeafletLatLng>({
    lat: 37.75197982788086,
    lng: -122.42283630371094,
  });
  const [endMarkerPos, setEndMarkerPos] = useState<LeafletLatLng>({
    lat: 37.76089096069336,
    lng: -122.43502807617188,
  });

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

  // takes a { lat, lng } object and finds closest node
  const findClosestNode = (latlng: LeafletLatLng) => {
    if (qt.size() > 0) {
      const lat = latlng.lat;
      const lon = latlng.lng;
      return qt.find(lat, lon);
    }
  };

  const handleClick = (e: LeafletMouseEvent) => {
    if (!startNode || !endNode) {
      const closest = findClosestNode(e.latlng);
      if (closest) {
        if (!startNode) {
          setStartNode(closest.key);
          setStartMarkerPos({ lat: closest.lat, lng: closest.lon });
        } else {
          setEndNode(closest.key);
          setEndMarkerPos({ lat: closest.lat, lng: closest.lon });
        }
      }
    }
  };

  const onStartNodeDrag = async (e: LeafletMouseEvent) => {
    const closest = findClosestNode(e.latlng);
    if (startNodeMarker && startNodeMarker.current) {
      const latlng = startNodeMarker.current.leafletElement.getLatLng();
      setStartMarkerPos({ lat: latlng.lat, lng: latlng.lng });
    }
    if (closest) {
      setStartNode(closest.key);
    }
  };

  const onEndNodeDrag = async (e: LeafletMouseEvent) => {
    const closest = findClosestNode(e.latlng);
    if (endNodeMarker && endNodeMarker.current) {
      const latlng = endNodeMarker.current.leafletElement.getLatLng();
      setEndMarkerPos({ lat: latlng.lat, lng: latlng.lng });
    }
    if (closest) {
      setEndNode(closest.key);
    }
  };

  // on finish drag, set position to nearest
  const onStartNodeDragEnd = () => {
    if (startNode && hasKey(nodeData, startNode)) {
      const node: nodeInfo = nodeData[startNode];
      setStartMarkerPos({ lat: node.lat, lng: node.lon });
    }
  };

  const onEndNodeDragEnd = () => {
    if (endNode && hasKey(nodeData, endNode)) {
      const node: nodeInfo = nodeData[endNode];
      setEndMarkerPos({ lat: node.lat, lng: node.lon });
    }
  };

  const renderMarkers = () => {
    let markers = [];
    if (startMarkerPos) {
      markers.push(
        <Marker
          ref={startNodeMarker}
          position={[startMarkerPos.lat, startMarkerPos.lng]}
          icon={marker}
          draggable
          ondrag={onStartNodeDrag}
          ondragend={onStartNodeDragEnd}
        />
      );
    }
    if (endMarkerPos) {
      markers.push(
        <Marker
          ref={endNodeMarker}
          position={[endMarkerPos.lat, endMarkerPos.lng]}
          icon={marker}
          draggable
          ondrag={onEndNodeDrag}
          ondragend={onEndNodeDragEnd}
        />
      );
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
