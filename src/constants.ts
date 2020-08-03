import { pair, cityDict, dataDict } from "./types";
import axios from "axios";

export const cities: Array<pair> = [
  { value: "san_francisco", label: "San Francisco (37K nodes, 3.9 MB)" },
  { value: "vancouver", label: "Vancouver (24K nodes, 2.5 MB)" },
  { value: "new_york", label: "New York (177K nodes, 17.7 MB)" },
  { value: "waterloo", label: "Waterloo (22K nodes, 2.0 MB)" },
];

export const algos: Array<pair> = [
  { value: "dijkstras", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "greedy", label: "Best First Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
];

interface algoDesc {
  name: string;
  desc: string;
  tags: string;
}

export const descriptions: Array<algoDesc> = [
  {
    name: "Dijkstra",
    desc:
      "Optimized breadth-first search that prioritizes exploring lower-cost paths.",
    tags: "weighted, shortest path guaranteed",
  },
  {
    name: "A*",
    desc:
      "Optimized Dijkstra for when we know end node location. Uses lat/long distance as heuristic.",
    tags: "weighted, shortest path guaranteed",
  },
  {
    name: "Greedy Best-First Search",
    desc: "Faster version of A* that doesn't guarantee shortest path",
    tags: "weighted, shortest path not guaranteed",
  },
  {
    name: "Breadth First Search",
    desc: "Explores all nodes equally in all directions, level-by-level",
    tags: "unweighted, shortest path guaranteed",
  },
  {
    name: "Depth First Search",
    desc: "Explores as far as possible along each branch before backtracing",
    tags: "unweighted, shortest path not guaranteed",
  },
];

export const cityLocs = {
  san_francisco: { lat: 37.7749, lng: -122.4194 },
  vancouver: { lat: 49.2827, lng: -123.1207 },
  new_york: { lat: 40.7128, lng: -74.006 },
  waterloo: { lat: 43.4643, lng: -80.5204 },
};

export const cityData: cityDict = {
  san_francisco: {
    data: {},
    file: "sanfran.json",
    loaded: false,
  },
  vancouver: {
    data: {},
    file: "vancouver.json",
    loaded: false,
  },
  new_york: {
    data: {},
    file: "newyork.json",
    loaded: false,
  },
  waterloo: {
    data: {},
    file: "waterloo.json",
    loaded: false,
  },
};

export async function getCityData(
  city: string,
  setLoading: (isLoading: boolean) => void,
  onProgress: (progress: number) => void
) {
  if (cityData[city].loaded) {
    return cityData[city].data;
  } else {
    const file = cityData[city].file;
    const { data: jsonData } = await axios.get(
      `https://pathfinding.kelvinzhang.ca/data/${file}`,
      {
        onDownloadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentage);
          if (percentage === 100) {
            setTimeout(() => {
              setLoading(false);
              cityData[city].loaded = true;
            }, 400);
          }
        },
      }
    );

    console.log(jsonData);
    cityData[city].data = jsonData;
    return cityData[city].data;
  }
}
