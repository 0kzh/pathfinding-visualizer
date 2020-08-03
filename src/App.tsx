import React, { useEffect, useState, useRef } from "react";
import { LeafletMouseEvent, LatLng } from "leaflet";
import { Map, Marker, TileLayer, ZoomControl } from "react-leaflet";
import AnimatedPolyline from "./lib/react-leaflet-animated-polyline/AnimatedPolyline";

// eslint-disable-next-line
import Worker from "worker-loader!./Worker";

import Tutorial from "./components/Tutorial";

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
import { qtNode, dataDict } from "./types";
import { markerA, markerB } from "./Icons";
import * as d3 from "d3-quadtree";
import {
  MarkGithubIcon,
  InfoIcon,
  MoonIcon,
  SunIcon,
} from "@primer/octicons-react";
import { cities, algos, cityLocs, getCityData } from "./constants";
import "./App.css";

const App: React.FC<{}> = () => {
  const [lng, setLng] = useState<number>(-122.4372);
  const [lat, setLat] = useState<number>(37.7546);
  const [zoom, setZoom] = useState<number>(11.48);

  const [worker, setWorker] = useState(() => new Worker());
  const [timeTaken, setTimeTaken] = useState<number>(-1);

  // start and end markers
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const startNodeMarker = useRef<Marker>(null);
  const endNodeMarker = useRef<Marker>(null);

  // pathfinding state
  const [nodes, setNodes] = useState<Set<string>>(new Set<string>());
  const [pathFound, setPathFound] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // final pathfinding path
  const [path, setPath] = useState<Array<LatLng>>(new Array<LatLng>());

  // configuration options
  const [algorithm, setAlgorithm] = useState<string>("dijkstras");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // tutorial modal state
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);

  const [city, setCity] = useState<string>("san_francisco");

  const [startMarkerPos, setStartMarkerPos] = useState<LatLng | null>(null);
  const [endMarkerPos, setEndMarkerPos] = useState<LatLng | null>(null);

  const [qt, setQt] = useState<d3.Quadtree<qtNode>>(d3.quadtree<qtNode>());
  const [nodeData, setNodeData] = useState<dataDict>({});

  useEffect(() => {
    if (city) {
      if (hasKey(cityLocs, city)) {
        setLat(cityLocs[city].lat);
        setLng(cityLocs[city].lng);
      }

      // reset state
      setStartNode(null);
      setEndNode(null);
      setPath(new Array<LatLng>());
      setTimeTaken(-1);
      setPathFound(false);
      setStartMarkerPos(null);
      setEndMarkerPos(null);

      getCityData(city, setLoading, setProgress).then((data) => {
        setNodeData(data);
      });
    }
  }, [city]);

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
    setIsRunning(true);
    if (startNode !== null && endNode !== null) {
      worker.postMessage(
        JSON.stringify({
          city: city,
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

  const pathfindingComplete = (path: Array<LatLng>) => {
    setPath(path);
    setIsRunning(false);
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

  const layerTiles = darkMode
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  if (loading) {
    return <div className="App">Loading city data {progress}%</div>;
  }

  return (
    <div className="App">
      <Tutorial
        darkMode={darkMode}
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
      />
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
                <option key={algo.value} value={algo.value}>
                  {algo.label}
                </option>
              ))}
            </Select>
            <TimeTaken />
          </div>
        </Child>
        <Child style={{ justifyContent: "center" }}>
          <Select onChange={(e) => setCity(e.target.value)}>
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </Select>
          <Button
            disabled={isRunning || !startNode || !endNode}
            onClick={() => runPathfinding(100, true)}
          >
            Visualize
          </Button>
        </Child>
        <Child style={{ justifyContent: "flex-end" }}>
          <IconWrapper
            style={{ color: darkMode ? "white" : "black" }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
          </IconWrapper>
          <IconWrapper
            style={{ color: darkMode ? "white" : "black" }}
            onClick={() => setIsOpen(true)}
          >
            <InfoIcon size={24} />
          </IconWrapper>
          <IconWrapper
            style={{ color: darkMode ? "white" : "black" }}
            onClick={() =>
              window.open(
                "https://github.com/0kzh/pathfinding-visualizer",
                "_blank"
              )
            }
          >
            <MarkGithubIcon size={24} />
          </IconWrapper>
        </Child>
      </Settings>

      <Map
        preferCanvas
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        onClick={handleClick}
      >
        <TileLayer
          url={layerTiles}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />

        <PathfindingMarkers nodeData={nodeData} nodes={nodes} />

        {/* Render start/end markers */}
        {startMarkerPos && (
          <Marker
            ref={startNodeMarker}
            position={[startMarkerPos.lat, startMarkerPos.lng]}
            icon={markerA}
            draggable
            ondrag={onStartNodeDrag}
            ondragend={onStartNodeDragEnd}
          />
        )}

        {endMarkerPos && (
          <Marker
            ref={endNodeMarker}
            position={[endMarkerPos.lat, endMarkerPos.lng]}
            icon={markerB}
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
