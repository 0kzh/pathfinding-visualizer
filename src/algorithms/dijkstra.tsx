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
  cb: (toRender: string[]) => void
) => {
  let queue = new TinyQueue([], (a: heapObj, b: heapObj) => {
    return a.distance - b.distance;
  });

  let distances: distanceDict = {};
  let previous: previousDict = {};
  let path: Array<string> = [];

  // render settings
  let total: number = 0;
  let nextRender: Array<string> = [];

  // build min heap
  distances[start] = 0;

  Object.keys(nodeData).forEach((node: string) => {
    if (node !== start) {
      distances[node] = Infinity;
      previous[node] = null;
    }
    queue.push({ key: node, distance: distances[node] });
  });

  while (queue.length > 0) {
    let smallest: string = queue.pop().key;
    nextRender.push(smallest);
    total++;

    const nodesPerRender = 0.0005 * total;

    if (total % nodesPerRender === 0) {
      if (delay > 0) {
        cb(nextRender);
        await sleep(delay);
      }
      nextRender = [];
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

      neighbors.forEach((neighbor) => {
        let alt = distances[smallest] + 1; // unweighted

        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          queue.push({ key: neighbor, distance: alt });
        }
      });
    }
  }
  // concat start because previous[start] won't exist
  return path.concat(start).reverse();
};

export default dijkstra;
