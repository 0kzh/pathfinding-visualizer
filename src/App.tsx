import React, { useEffect, useState, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import { LeafletEvent, LeafletMouseEvent, Icon, LatLng } from "leaflet";
import {
  Map,
  Marker,
  Polyline,
  PolylineProps,
  TileLayer,
  ZoomControl,
} from "react-leaflet";

import AnimatedPolyline from "./lib/react-leaflet-animated-polyline/AnimatedPolyline";

import { ValueType } from "react-select/src/types";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import findPath from "./pathfinding";
import Settings from "./components/Settings";
import { nodeInfo, qtNode } from "./types";
import { hasKey } from "./utils";
import { marker, nodeMarker, visitedNodeMarker } from "./Icons";
import * as d3 from "d3-quadtree";

import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  // start and end markers
  const [startNode, setStartNode] = useState<string | null>("258968250");
  const [endNode, setEndNode] = useState<string | null>("65296327");
  const startNodeMarker = useRef<Marker>(null);
  const endNodeMarker = useRef<Marker>(null);

  // pathfinding state
  const [nodes, setNodes] = useState<Array<string>>(new Array<string>());
  const [prevNodes, setPrevNodes] = useState<Array<string>>(
    new Array<string>()
  );
  const [pathFound, setPathFound] = useState<boolean>(false);

  // final pathfinding path
  const [path, setPath] = useState<Array<LatLng>>(new Array<LatLng>());

  const [startMarkerPos, setStartMarkerPos] = useState<LatLng>(
    new LatLng(37.75197982788086, -122.42283630371094)
  );
  const [endMarkerPos, setEndMarkerPos] = useState<LatLng>(
    new LatLng(37.76089096069336, -122.43502807617188)
  );

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
  const findClosestNode = (latlng: LatLng) => {
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
          setStartMarkerPos(new LatLng(closest.lat, closest.lon));
        } else {
          setEndNode(closest.key);
          setEndMarkerPos(new LatLng(closest.lat, closest.lon));
        }
      }
    }
  };

  const onStartNodeDrag = async (e: LeafletMouseEvent) => {
    const closest = findClosestNode(e.latlng);
    if (startNodeMarker && startNodeMarker.current) {
      const latlng = startNodeMarker.current.leafletElement.getLatLng();
      setStartMarkerPos(new LatLng(latlng.lat, latlng.lng));
    }
    if (closest) {
      setStartNode(closest.key);
    }
  };

  const onEndNodeDrag = async (e: LeafletMouseEvent) => {
    const closest = findClosestNode(e.latlng);
    if (endNodeMarker && endNodeMarker.current) {
      const latlng = endNodeMarker.current.leafletElement.getLatLng();
      setEndMarkerPos(new LatLng(latlng.lat, latlng.lng));
    }
    if (closest) {
      setEndNode(closest.key);
    }
  };

  // on finish drag, set position to nearest
  const onStartNodeDragEnd = () => {
    if (startNode && hasKey(nodeData, startNode)) {
      const node: nodeInfo = nodeData[startNode];
      setStartMarkerPos(new LatLng(node.lat, node.lon));
    }
  };

  const onEndNodeDragEnd = () => {
    if (endNode && hasKey(nodeData, endNode)) {
      const node: nodeInfo = nodeData[endNode];
      setEndMarkerPos(new LatLng(node.lat, node.lon));
    }
  };

  const runPathfinding = async (delayInMs: number, shouldReset: boolean) => {
    if (shouldReset) {
      setPathFound(false);
    }
    if (startNode !== null && endNode !== null) {
      const resultPath = await findPath(
        startNode,
        endNode,
        delayInMs,
        addNodes
      );
      if (resultPath) {
        setPathFound(true);
        pathfindingComplete(resultPath);
      }
    }
  };

  useEffect(() => {
    // on start, end node change, redo pathfinding
    if (pathFound) {
      runPathfinding(0, false);
    }
  }, [startNode, endNode]);

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

  const addNodes = (nodesToRender: string[]) => {
    setNodes(nodesToRender);
    setPrevNodes((oldNodes) => oldNodes.concat(nodesToRender));
  };

  const clearNodes = () => {
    // setNodes(new Set<string>());
  };

  const pathfindingComplete = (path: Array<LatLng>) => {
    setPath(path);
    // clearNodes();
  };

  return (
    <div className="App">
      <Settings
        startNode={startNode}
        endNode={endNode}
        runPathfindingHandler={() => {
          runPathfinding(100, true);
        }}
      />
      <Map
        preferCanvas
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

        {/* This renders nodes for the current iteration */}
        {Array.from(nodes).map((node: string) => {
          if (hasKey(nodeData, node)) {
            const val: nodeInfo = nodeData[node];
            return (
              <Marker
                key={node}
                position={[val.lat, val.lon]}
                icon={nodeMarker}
              />
            );
          }
        })}

        {/* Render visited nodes */}
        {/* {Array.from(prevNodes).map((node: string) => {
          if (hasKey(nodeData, node)) {
            const val: nodeInfo = nodeData[node];
            return (
              <Marker
                key={node}
                position={[val.lat, val.lon]}
                icon={visitedNodeMarker}
              />
            );
          }
        })} */}

        {/* Render start/end markers */}
        {renderMarkers()}

        {/* Render final path, if exists */}
        {pathFound && <AnimatedPolyline positions={path} />}
      </Map>
    </div>
  );
};
export default App;
