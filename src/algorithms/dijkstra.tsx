import TinyQueue from "tinyqueue";
import nodeData from "../data/sanfran.json";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";

interface distanceDict {
  [key: string]: number;
}

interface visitedDict {
  [key: string]: boolean;
}

interface previousDict {
  [key: string]: string | null;
}

interface heapObj {
  key: string;
  distance: number;
}

// find shortest path from start to end using dijkstra's
// cb is called when a new node is visited
const dijkstra = (start: string, end: string, cb: () => void) => {
  let queue = new TinyQueue([], (a: heapObj, b: heapObj) => {
    return a.distance - b.distance;
  });

  let distances: distanceDict = {};
  let previous: previousDict = {};
  let path: Array<string> = [];

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

    if (smallest == end) {
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
    } else {
      console.log(smallest + " doesnt exist!");
    }
  }
  // concast start because previous[start] won't exist
  return path.concat(start).reverse();
};

export default dijkstra;
