import TinyQueue from "tinyqueue";
import nodeData from "../data/sanfran.json";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";

interface distanceDict {
  [key: string]: number;
}

interface previousDict {
  [key: string]: string | null;
}

interface heapObj {
  key: string;
  distance: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// find shortest path from start to end using dijkstra's
// cb is called when a new node is visited
const dijkstra = async (
  start: string,
  end: string,
  delay: number,
  cb: (toRender: Set<string>) => void
) => {
  let queue = new TinyQueue([], (a: heapObj, b: heapObj) => {
    return a.distance - b.distance;
  });

  let distances: distanceDict = {};
  let previous: previousDict = {};
  let path: Array<string> = [];
  let rendered: Set<string> = new Set<string>();

  // render settings
  let level: number = 0;
  let total: number = 0;
  let nextRender: Set<string> = new Set<string>();

  // build min heap
  distances[start] = 0;
  queue.push({ key: "_", distance: 1 });

  Object.keys(nodeData).forEach((node: string) => {
    if (node !== start) {
      distances[node] = Infinity;
      previous[node] = null;
    }
    queue.push({ key: node, distance: distances[node] });
  });

  while (queue.length > 0) {
    let temp = queue.pop();
    let smallest: string = temp.key;

    if (smallest === "_") {
      if (delay > 0 && nextRender.size > 0) {
        cb(nextRender);
        await sleep(delay);
        nextRender.clear();
        rendered.clear();
      }
      continue;
    }

    total++;

    if (total % (level ^ 10) == 0 && !rendered.has(smallest)) {
      nextRender.add(smallest);
      rendered.add(smallest);
    }

    if (smallest == end) {
      cb(nextRender);
      while (previous[smallest]) {
        path.push(smallest);
        const prev = previous[smallest];
        if (prev != null) {
          smallest = prev;
        }
      }
      break;
    }

    if (hasKey(nodeData, smallest)) {
      let smallestNode: nodeInfo = nodeData[smallest];
      let neighbors: Array<string> = smallestNode.adj;

      let maxDist = 0;
      neighbors.forEach((neighbor) => {
        let alt = distances[smallest] + 1; // unweighted
        maxDist = Math.max(maxDist, alt);
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          queue.push({ key: neighbor, distance: alt });
        }
      });
      if (maxDist > level) {
        level = maxDist;
        queue.push({ key: "_", distance: maxDist });
      }
    }
  }
  // concat start because previous[start] won't exist
  return path.concat(start).reverse();
};

export default dijkstra;
