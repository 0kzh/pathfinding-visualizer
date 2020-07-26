import React, { useEffect, useState, useRef, useMemo } from "react";
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

// eslint-disable-next-line
import Worker from "worker-loader!./Worker";

import { ValueType } from "react-select/src/types";
import nodeData from "./data/sanfran.json";
import cities from "./data/locations.json";
import findPath from "./pathfinding";
import Settings from "./components/Settings";
import PathfindingMarkers from "./components/PathfindingMarkers";

import { nodeInfo, qtNode, pair } from "./types";
import { marker, nodeMarker, visitedNodeMarker } from "./Icons";
import * as d3 from "d3-quadtree";

import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);

  const [worker, setWorker] = useState(() => new Worker());

  // start and end markers
  const [startNode, setStartNode] = useState<string | null>("258968250");
  const [endNode, setEndNode] = useState<string | null>("65296327");
  const startNodeMarker = useRef<Marker>(null);
  const endNodeMarker = useRef<Marker>(null);

  // pathfinding state
  const [nodes, setNodes] = useState<Set<string>>(new Set<string>());
  const [prevNodes, setPrevNodes] = useState<Set<string>>(new Set<string>());
  const [pathFound, setPathFound] = useState<boolean>(false);

  // final pathfinding path
  const [path, setPath] = useState<Array<LatLng>>(new Array<LatLng>());

  const [algorithm, setAlgorithm] = useState<ValueType<pair>>({
    value: "dijkstas",
    label: "Dijkstra's Algorithm",
  });

  const [startMarkerPos, setStartMarkerPos] = useState<LatLng>(
    new LatLng(37.75197982788086, -122.42283630371094)
  );
  const [endMarkerPos, setEndMarkerPos] = useState<LatLng>(
    new LatLng(37.76089096069336, -122.43502807617188)
  );

  const [qt, setQt] = useState<d3.Quadtree<qtNode>>(d3.quadtree<qtNode>());

  useEffect(() => {
    worker.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      const type = data.type;
      if (type === "updateNodes") {
        const nodes = new Set<string>(data.nodes);
        if (nodes) {
          addNodes(nodes);
        }
      } else if (type === "setPath") {
        const path = data.path;
        if (path) {
          setPathFound(true);
          pathfindingComplete(path);
        }
      }
    };
  }, [worker]);

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

  const onStartNodeDrag = async (e: LeafletMouseEvent) => {};

  const onEndNodeDrag = async (e: LeafletMouseEvent) => {};

  // on finish drag, set position to nearest
  const onStartNodeDragEnd = (e: any) => {
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setStartNode(closest.key);
      setStartMarkerPos(new LatLng(closest.lat, closest.lon));
    }
    // if (pathFound) {
    //   runPathfinding(0, true);
    // }
  };

  const onEndNodeDragEnd = (e: any) => {
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setEndNode(closest.key);
      setEndMarkerPos(new LatLng(closest.lat, closest.lon));
    }
  };

  const runPathfinding = async (delayInMs: number, shouldReset: boolean) => {
    console.log("called!!!");
    if (shouldReset) {
      setNodes(new Set<string>());
      setPrevNodes(new Set<string>());
    }
    if (startNode !== null && endNode !== null) {
      worker.postMessage(
        JSON.stringify({
          algorithm: algorithm,
          startNode: startNode,
          endNode: endNode,
          delayInMs: delayInMs,
        })
      );
    }
  };

  useEffect(() => {
    // on start, end node change, redo pathfinding
    if (pathFound) {
      runPathfinding(0, true);
    }
  }, [startNode, endNode]);

  const addNodes = (nodesToRender: Set<string>) => {
    setNodes(nodesToRender);
    setPrevNodes((oldNodes) => new Set([...oldNodes, ...nodesToRender]));
  };

  const clearNodes = () => {
    setNodes(new Set<string>());
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
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
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

        <PathfindingMarkers nodes={nodes} prevNodes={prevNodes} />

        {/* Render start/end markers */}
        {startMarkerPos && (
          <Marker
            ref={startNodeMarker}
            position={[startMarkerPos.lat, startMarkerPos.lng]}
            icon={marker}
            draggable
            ondrag={onStartNodeDrag}
            ondragend={onStartNodeDragEnd}
          />
        )}

        {endMarkerPos && (
          <Marker
            ref={endNodeMarker}
            position={[endMarkerPos.lat, endMarkerPos.lng]}
            icon={marker}
            draggable
            ondragstart={() => {
              setPath([]);
            }}
            ondrag={onEndNodeDrag}
            ondragend={onEndNodeDragEnd}
          />
        )}

        {/* Render final path, if exists */}
        {pathFound && path.length > 0 && (
          <AnimatedPolyline positions={path} snakeSpeed={300} />
        )}
      </Map>
    </div>
  );
};
export default App;
