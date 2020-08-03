/* eslint-disable no-restricted-globals */
import { getCityData } from "./constants";

import dijkstra from "./algorithms/dijkstra";
import astar from "./algorithms/astar";
import bfs from "./algorithms/bfs";
import dfs from "./algorithms/dfs";
import greedy from "./algorithms/greedy";
import { nodeInfo, pair, LeafletLatLng } from "./types";
import { hasKey } from "./utils";
import { ValueType } from "react-select/src/types";

const algorithmDict = {
  dijkstras: dijkstra,
  astar: astar,
  greedy: greedy,
  bfs: bfs,
  dfs: dfs,
};

const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener("message", async (event) => {
  const { city, algorithm, startNode, endNode, delayInMs } = JSON.parse(
    event.data
  );
  const addNodesHandler = (nodes: Set<string>) => {
    ctx.postMessage(JSON.stringify({ type: "updateNodes", nodes: [...nodes] }));
  };
  const [path, timeTaken] = await findPath(
    city,
    algorithm,
    startNode,
    endNode,
    delayInMs,
    addNodesHandler
  );
  ctx.postMessage(
    JSON.stringify({ type: "setPath", path: path, timeTaken: timeTaken })
  );
});

const findPath = async (
  city: string,
  algorithm: string,
  startNode: string,
  endNode: string,
  delayInMs: number,
  addNodesHandler: (node: Set<string>) => void
) => {
  const nodeData = getCityData(city);
  if (startNode && endNode && algorithm) {
    if (hasKey(algorithmDict, algorithm)) {
      const selectedAlgorithm: Function = algorithmDict[algorithm];
      const [shortestPath, timeTaken] = await selectedAlgorithm(
        city,
        startNode,
        endNode,
        delayInMs,
        addNodesHandler
      );

      if (!shortestPath) return;

      // create array of latlng points to draw final path
      let path: Array<LeafletLatLng> = [];
      for (const nodeId of shortestPath) {
        if (hasKey(nodeData, nodeId)) {
          const node: nodeInfo = nodeData[nodeId];
          path.push({ lat: node.lat, lng: node.lon });
        }
      }
      return [path, timeTaken];
    }
  }
};
