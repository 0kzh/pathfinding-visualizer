import nodeData from "../data/sanfran.json";
import { nodeInfo } from "../types";
import { hasKey } from "../utils";

// find shortest path from start to end using bfs's
// cb is called when a new node is visited
const bfs = (
  start: string,
  end: string,
  delay: number,
  cb: (toRender: string[]) => void
) => {
  let queue: string[][] = [];

  queue.push([start]);
  while (queue.length > 0) {
    const path: string[] | undefined = queue.shift();
    if (!path) continue;
    const node = path[path.length - 1];
    if (node == end) {
      return path;
    }

    if (hasKey(nodeData, node)) {
      let smallestNode: nodeInfo = nodeData[node];
      let neighbors: Array<string> = smallestNode.adj;

      neighbors.forEach((neighbor) => {
        let newPath: string[] = path;
        newPath.push(neighbor);
        queue.push(newPath);
      });
    }
  }
};

export default bfs;
