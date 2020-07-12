import nodeData from "../data/sanfran.json";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";

interface previousDict {
  [key: string]: Array<string>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// find shortest path from start to end using bfs's
// cb is called when a new node is visited
const dfs = async (
  start: string,
  end: string,
  delay: number,
  cb: (toRender: string[]) => void
) => {
  let stack: string[] = [];
  let visitedNodes = new Set<string>();
  let previous: previousDict = {};
  let path: Array<string> = [];

  let total: number = 0;
  let nextRender: Array<string> = [];

  Object.keys(nodeData).forEach((node: string) => {
    previous[node] = [];
  });

  stack.push(start);
  while (stack.length > 0) {
    const popped: string | undefined = stack.pop();
    if (!popped) return;
    let node = popped;

    if (total % 50 === 0) {
      nextRender.push(node);
    }
    total++;
    const nodesPerRender = 0.0001 * total;

    if (total % nodesPerRender === 0) {
      if (delay > 0) {
        cb(nextRender);
        await sleep(delay);
      }
      nextRender = [];
    }

    if (node === end) {
      while (previous[node].length > 0) {
        const first = previous[node].shift();
        if (!first) continue;
        path.push(first);
        node = first;
      }
      return path;
    }
    if (!visitedNodes.has(node)) {
      visitedNodes.add(node);
      if (hasKey(nodeData, node)) {
        let smallestNode: nodeInfo = nodeData[node];
        let neighbors: Array<string> = smallestNode.adj;

        neighbors.forEach((neighbor) => {
          stack.push(neighbor);
          previous[neighbor].push(node);
        });
      }
    }
  }
  return false;
};

export default dfs;
