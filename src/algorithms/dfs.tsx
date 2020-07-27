import { getCityData } from "../constants";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";
import Timer from "timer-machine";

interface previousDict {
  [key: string]: Array<string>;
}

interface parentDict {
  [key: string]: string;
}

interface indexDict {
  [key: string]: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// find shortest path from start to end using bfs's
// cb is called when a new node is visited
const dfs = async (
  city: string,
  start: string,
  end: string,
  delay: number,
  cb: (toRender: Set<string>) => void
) => {
  const nodeData = getCityData(city);
  let stack: [string, Array<string>][] = [];
  let visitedNodes = new Set<string>();
  let path: Array<string> = [];
  let total: number = 0;
  let nextRender: Set<string> = new Set<string>();

  stack.push([start, [start]]);
  const timer = new Timer();
  timer.start();
  while (stack.length > 0) {
    const popped: [string, Array<string>] | undefined = stack.pop();
    if (!popped) return;
    let node = popped[0];
    path = popped[1];

    if (total % 50 === 0) {
      nextRender.add(node);
    }
    total++;
    const nodesPerRender = 0.0001 * total;

    if (total % nodesPerRender === 0) {
      if (delay > 0) {
        cb(nextRender);
        timer.stop();
        await sleep(delay);
        timer.start();
      }
      nextRender = new Set<string>();
    }

    if (node === end) {
      break;
    }
    if (!visitedNodes.has(node)) {
      visitedNodes.add(node);
      if (hasKey(nodeData, node)) {
        let smallestNode: nodeInfo = nodeData[node];
        let neighbors: Array<string> = smallestNode.adj;

        neighbors.forEach((neighbor) => {
          stack.push([neighbor, [neighbor, ...path]]);
        });
      }
    }
  }
  return [path.reverse(), timer.time()];
};

export default dfs;
