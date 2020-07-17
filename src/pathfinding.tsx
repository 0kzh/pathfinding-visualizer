import nodeData from "./data/sanfran.json";
import dijkstra from "./algorithms/dijkstra";
import bfs from "./algorithms/bfs";
import dfs from "./algorithms/dfs";
import { LatLng } from "leaflet";
import { nodeInfo, pair } from "./types";
import { hasKey } from "./utils";
import { ValueType } from "react-select/src/types";

const algorithmDict = {
  dijkstas: dijkstra,
  astar: dijkstra,
  greedy: dijkstra,
  bfs: bfs,
  dfs: dfs,
};

const findPath = async (
  algorithm: ValueType<pair>,
  startNode: string,
  endNode: string,
  delayInMs: number,
  addNodesHandler: (node: Set<string>) => void
) => {
  if (startNode && endNode && algorithm) {
    const algoName = (algorithm as pair).value;
    if (hasKey(algorithmDict, algoName)) {
      const selectedAlgorithm: Function = algorithmDict[algoName];
      const shortestPath = await selectedAlgorithm(
        startNode,
        endNode,
        delayInMs,
        addNodesHandler
      );

      if (!shortestPath) return;

      // create array of latlng points to draw final path
      let path: Array<LatLng> = [];
      for (const nodeId of shortestPath) {
        if (hasKey(nodeData, nodeId)) {
          const node: nodeInfo = nodeData[nodeId];
          path.push(new LatLng(node.lat, node.lon));
        }
      }
      return path;
    }
  }
};

export default findPath;
