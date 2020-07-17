import nodeData from "./data/sanfran.json";
import dijkstra from "./algorithms/dijkstra";
import bfs from "./algorithms/bfs";
import dfs from "./algorithms/dfs";
import { LatLng } from "leaflet";
import { nodeInfo } from "./types";
import { hasKey } from "./utils";

const findPath = async (
  startNode: string,
  endNode: string,
  delayInMs: number,
  addNodesHandler: (node: Set<string>) => void
) => {
  if (startNode && endNode) {
    const shortestPath = await dfs(
      startNode,
      endNode,
      delayInMs,
      addNodesHandler
    );

    console.log(shortestPath);

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
};

export default findPath;
