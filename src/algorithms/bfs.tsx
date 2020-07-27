import Deque from "double-ended-queue";
import { getCityData } from "../constants";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";
import Timer from "timer-machine";

interface previousDict {
  [key: string]: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// find shortest path from start to end using bfs's
// cb is called when a new node is visited
const bfs = async (
  city: string,
  start: string,
  end: string,
  delay: number,
  cb: (toRender: Set<string>) => void
) => {
  const nodeData = getCityData(city);
  // we use nulls to keep track of the current level
  let queue: Deque<string | null> = new Deque();
  let path: Array<string> = [];
  let previous: previousDict = {};
  let discovered: Set<string> = new Set<string>();
  let rendered: Set<string> = new Set<string>();

  let level: number = 0;
  let total: number = 0;
  let nextRender: Set<string> = new Set<string>();

  Object.keys(nodeData).forEach((node: string) => {
    previous[node] = null;
  });

  queue.push(start);
  queue.push(null);
  const timer = new Timer();
  timer.start();
  while (queue.length > 0) {
    const prev: string | null | undefined = queue.shift();

    if (prev === null) {
      level++;
      // console.log(`level ${level}: ${total}`);
      // console.log(`rendering: ${nextRender.size}`);
      total = 0;
      if (delay > 0) {
        cb(nextRender);
        timer.stop();
        await sleep(delay);
        timer.start();
        nextRender = new Set<string>();
      }
      queue.push(null);
      continue;
    }

    if (!prev) continue;

    let node = prev;
    total++;

    if (total % (100 / total) === 0 && !rendered.has(node)) {
      nextRender.add(node);
      rendered.add(node);
    }

    if (node == end) {
      cb(nextRender);
      while (previous[node]) {
        path.push(node);
        const prev = previous[node];
        if (prev !== null) {
          node = prev;
        }
      }
      break;
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
  return [path.reverse(), timer.time()];
};

export default bfs;
