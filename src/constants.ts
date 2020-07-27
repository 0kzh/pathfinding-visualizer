import { nodeInfo, qtNode, pair, cityDict, dataDict } from "./types";
import sanFran from "./data/sanfran.json";
import vancouver from "./data/vancouver.json";
import newYork from "./data/newyork.json";
import { hasKey } from "./utils";

export const cities: Array<pair> = [
  { value: "san_francisco", label: "San Francisco (37K nodes, 3.9 MB)" },
  { value: "vancouver", label: "Vancouver (24K nodes, 2.5 MB)" },
  { value: "new_york", label: "New York (177K nodes, 17.7 MB)" },
  { value: "waterloo", label: "Waterloo" },
];

export const algos: Array<pair> = [
  { value: "dijkstras", label: "Dijkstra's Algorithm" },
  { value: "astar", label: "A* Search" },
  { value: "greedy", label: "Best First Search" },
  { value: "bfs", label: "Breadth First Search" },
  { value: "dfs", label: "Depth First Search" },
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
  waterloo: sanFran,
};

export function getCityData(city: string): dataDict {
  return cityData[city];
}
