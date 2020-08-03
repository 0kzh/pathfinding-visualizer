import TinyQueue from "tinyqueue";
import { getCityData } from "../constants";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";
import Timer from "timer-machine";

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
const greedy = async (
  city: string,
  start: string,
  end: string,
  delay: number,
  cb: (toRender: Set<string>) => void
) => {
  const nodeData = await getCityData(
    city,
    () => {},
    () => {}
  );

  const getDistance = function (nodeA: string, nodeB: string) {
    if (hasKey(nodeData, nodeA) && hasKey(nodeData, nodeB)) {
      const posA = nodeData[nodeA];
      const posB = nodeData[nodeB];

      var d1 = Math.abs(posB.lat - posA.lat);
      var d2 = Math.abs(posB.lon - posA.lon);

      const dist = Math.sqrt(d1 * d1 + d2 * d2);
      // console.log(dist);
      return dist;
    }
    return -1;
  };

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

  const timer = new Timer();
  timer.start();
  while (queue.length > 0) {
    let temp = queue.pop();
    let smallest: string = temp.key;

    total++;

    if (total % 2 == 0 && !rendered.has(smallest)) {
      nextRender.add(smallest);
      rendered.add(smallest);
    }

    if (nextRender.size % 10 === 0) {
      cb(nextRender);
      timer.stop();
      await sleep(delay);
      timer.start();
      nextRender = new Set<string>();
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
        let alt = getDistance(end, neighbor); // unweighted
        maxDist = Math.max(maxDist, alt);
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = smallest;

          queue.push({ key: neighbor, distance: alt });
        }
      });
    }
  }
  // concat start because previous[start] won't exist
  return [path.concat(start).reverse(), timer.time()];
};

export default greedy;
