import { pair, cityDict, dataDict } from "./types";
import sanFran from "./data/sanfran.json";
import vancouver from "./data/vancouver.json";
import newYork from "./data/newyork.json";
import waterloo from "./data/waterloo.json";

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
  san_francisco: sanFran,
  vancouver: vancouver,
  new_york: newYork,
  waterloo: waterloo,
};

export function getCityData(city: string): dataDict {
  return cityData[city];
}
