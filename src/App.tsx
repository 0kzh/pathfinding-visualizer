import React, { useEffect, useState, useRef, useMemo } from "react";
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
// import Settings from "./components/Settings";
import {
  Settings,
  Child,
  Select,
  Button,
  IconWrapper,
  Label,
  StatContainer,
} from "./components/Styles";
import PathfindingMarkers from "./components/PathfindingMarkers";
import { hasKey } from "./utils";
import { nodeInfo, qtNode, pair } from "./types";
import { marker, nodeMarker, visitedNodeMarker } from "./Icons";
import * as d3 from "d3-quadtree";
import { MarkGithubIcon, InfoIcon } from "@primer/octicons-react";

import "./App.css";

const cities: Array<pair> = [
  { value: "san_francisco", label: "San Francisco (37K nodes, 3.9 MB)" },
  { value: "new_york", label: "New York" },
  { value: "vancouver", label: "Vancouver" },
  { value: "waterloo", label: "Waterloo" },
];

const algos: Array<pair> = [
  { value: "dijkstras", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "greedy", label: "Best First Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
];

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState(-122.4372);
  const [lat, setLat] = useState(37.7546);
  const [zoom, setZoom] = useState(11.48);
  // let numEdges = 0;
  // Object.keys(nodeData).map((key) => {
  //   if (hasKey(nodeData, key)) {
  //     numEdges += nodeData[key].adj.length;
  //   }
  // });
  // console.log(numEdges / 2);
  // console.log(Object.keys(nodeData).length);
  const [worker, setWorker] = useState(() => new Worker());
  const [timeTaken, setTimeTaken] = useState<number>(-1);

  // start and end markers
  const [startNode, setStartNode] = useState<string | null>("258968250");
  const [endNode, setEndNode] = useState<string | null>("65296327");
  const startNodeMarker = useRef<Marker>(null);
  const endNodeMarker = useRef<Marker>(null);

  // pathfinding state
  const [nodes, setNodes] = useState<Set<string>>(new Set<string>());
  const [pathFound, setPathFound] = useState<boolean>(false);

  // final pathfinding path
  const [path, setPath] = useState<Array<LatLng>>(new Array<LatLng>());

  // configuration options
  const [algorithm, setAlgorithm] = useState<string>("dijkstras");

  const [city, setCity] = useState<string>("san_francisco");

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
        const timeTaken = data.timeTaken;
        if (path) {
          setPathFound(true);
          setTimeTaken(data.timeTaken);
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
    if (shouldReset) {
      setNodes(new Set<string>());
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
    setNodes((oldNodes) => new Set([...oldNodes, ...nodesToRender]));
  };

  const clearNodes = () => {
    setNodes(new Set<string>());
  };

  const pathfindingComplete = (path: Array<LatLng>) => {
    setPath(path);
    // clearNodes();
  };

  const TimeTaken = () => {
    let timeTakenText;
    let pathLengthText;
    if (timeTaken >= 0) {
      if (pathFound) {
        timeTakenText = `Path found in ${timeTaken / 1000.0} seconds`;
        pathLengthText =
          path.length > 0 ? `Path length: ${path.length} nodes` : null;
      } else {
        timeTakenText = "Finding path...";
      }
    }
    return (
      <StatContainer>
        <Label>{timeTakenText}</Label>
        <Label>{pathLengthText}</Label>
      </StatContainer>
    );
  };

  return (
    <div className="App">
      <Settings>
        <Child style={{ justifyContent: "flex-start" }}>
          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Select onChange={(e) => setAlgorithm(e.target.value)}>
              {algos.map((algo) => (
                <option value={algo.value}>{algo.label}</option>
              ))}
            </Select>
            <TimeTaken />
          </div>
        </Child>
        <Child style={{ justifyContent: "center" }}>
          <Select onChange={(e) => setCity(e.target.value)}>
            {cities.map((city) => (
              <option value={city.value}>{city.label}</option>
            ))}
          </Select>
          <Button
            disabled={!startNode || !endNode}
            onClick={() => runPathfinding(100, true)}
          >
            Visualize
          </Button>
        </Child>
        <Child style={{ justifyContent: "flex-end" }}>
          <IconWrapper>
            <InfoIcon size={24} />
          </IconWrapper>
          <IconWrapper>
            <MarkGithubIcon size={24} />
          </IconWrapper>
        </Child>
      </Settings>

      {/* <Stats city={city} /> */}
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

        <PathfindingMarkers nodes={nodes} />

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
