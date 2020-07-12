import nodeData from "./data/sanfran.json";
import dijkstra from "./algorithms/dijkstra";
import bfs from "./algorithms/bfs";
import dfs from "./algorithms/dfs";
import { nodeInfo, LeafletLatLng } from "./types";
import { hasKey } from "./utils";

const findPath = async (
  startNode: string,
  endNode: string,
  delayInMs: number,
  addNodesHandler: (node: string[]) => void
) => {
  if (startNode && endNode) {
    const shortestPath = await dfs(
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
    return path;
  }
};

export default findPath;
