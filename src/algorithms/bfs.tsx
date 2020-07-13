import Deque from "double-ended-queue";
import nodeData from "../data/sanfran.json";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";

interface previousDict {
  [key: string]: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// find shortest path from start to end using bfs's
// cb is called when a new node is visited
const bfs = async (
  start: string,
  end: string,
  delay: number,
  cb: (toRender: string[]) => void
) => {
  // we use nulls to keep track of the current level
  let queue: Deque<string | null> = new Deque();
  let previous: previousDict = {};
  let discovered: Set<string> = new Set<string>();
  let rendered: Set<string> = new Set<string>();

  let level: number = 0;
  let total: number = 0;
  let nextRender: Array<string> = [];

  Object.keys(nodeData).forEach((node: string) => {
    previous[node] = null;
  });

  queue.push(start);
  queue.push(null);
  while (queue.length > 0) {
    const prev: string | null | undefined = queue.shift();

    if (prev === null) {
      level++;
      if (delay > 0) {
        cb(nextRender);
        await sleep(delay);
      }
      nextRender = [];
      queue.push(null);
      continue;
    }

    if (!prev) continue;

    let node = prev;
    total++;

    if (total % (level * 0.5) == 0 && !rendered.has(node)) {
      nextRender.push(node);
      rendered.add(node);
    }

    if (node == end) {
      let path = [];
      while (previous[node]) {
        path.push(node);
        const prev = previous[node];
        if (prev !== null) {
          node = prev;
        }
      }
      return path;
    }

    if (hasKey(nodeData, node)) {
      let smallestNode: nodeInfo = nodeData[node];
      let neighbors: Array<string> = smallestNode.adj;

      neighbors.forEach((neighbor) => {
        if (!discovered.has(neighbor)) {
          discovered.add(node);
          previous[neighbor] = node;
          queue.push(neighbor);
        }
      });
    }
  }
  return [];
};

export default bfs;
