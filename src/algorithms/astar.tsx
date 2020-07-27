import TinyQueue from "tinyqueue";
import BinaryHeap from "../structures/BinaryHeap";
import { getCityData } from "../constants";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";
import Timer from "timer-machine";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Node {
  f: number;
  g: number;
  h: number;
  ref: string;
  visited: boolean;
  closed: boolean;
  neighbors: string[];
  parent: Node | null;

  constructor(nodeId: string, neighbors: string[]) {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.visited = false;
    this.closed = false;
    this.ref = nodeId;
    this.neighbors = neighbors;
    this.parent = null;
  }
}

interface Graph {
  [id: string]: Node;
}

const graph: Graph = {};

function pathTo(node: Node) {
  var curr: Node = node;
  var path = [];
  console.log(curr.parent);
  while (curr.parent) {
    path.unshift(curr.ref);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function (node: Node) {
    return node.f;
  });
}

const astar = async (
  city: string,
  start: string,
  end: string,
  delay: number,
  cb: (toRender: Set<string>) => void
) => {
  const nodeData = getCityData(city);

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

  let openHeap = getHeap();

  let total: number = 0;
  let nextRender: Set<string> = new Set<string>();
  let rendered: Set<string> = new Set<string>();

  Object.keys(nodeData).forEach((key) => {
    if (hasKey(nodeData, key)) {
      graph[key] = new Node(key, nodeData[key].adj);
    }
  });

  if (!hasKey(graph, start) || !hasKey(graph, end)) {
    return;
  }
  // build min heap
  const startNode = graph[start];
  openHeap.push(startNode);
  const timer = new Timer();
  timer.start();
  while (openHeap.size() > 0) {
    const currentNode = openHeap.pop();
    const currentNodeId: string = currentNode.ref;

    if (currentNodeId === end) {
      return [pathTo(currentNode), timer.time()];
    }

    if (total % 2 == 0 && !rendered.has(currentNodeId)) {
      nextRender.add(currentNodeId);
      rendered.add(currentNodeId);
    }

    if (nextRender.size % 10 === 0) {
      cb(nextRender);
      timer.stop();
      await sleep(delay);
      timer.start();
      nextRender = new Set<string>();
    }

    currentNode.closed = true;

    if (hasKey(graph, currentNodeId)) {
      const node: Node = graph[currentNodeId];
      const neighbors: Array<string> = node.neighbors;

      neighbors.forEach((neighbor) => {
        const neighborNode = graph[neighbor];
        if (neighborNode.closed) {
          return;
        }

        // g score is shortest distance from start to current node
        // need to check if path we arrat at is the shortest we've seen
        const gScore = currentNode.g + getDistance(currentNode, neighbor);
        const visited = neighborNode.visited;

        if (!visited || gScore < neighborNode.g) {
          neighborNode.visited = true;
          neighborNode.parent = currentNode;
          neighborNode.h = neighborNode.h || getDistance(neighbor, end);
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.h + neighborNode.g;

          if (!visited) {
            openHeap.push(neighborNode);
          } else {
            openHeap.rescoreElement(neighborNode);
          }
        }
      });
    }
  }
  return [[], timer.time()];
};

export default astar;
