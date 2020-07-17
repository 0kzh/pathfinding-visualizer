import { Icon } from "leaflet";

export const marker = new Icon({
  iconUrl: "/marker.svg",
  iconSize: [32, 32],
});

export const nodeMarker = new Icon({
  iconUrl: "/node.svg",
  iconSize: [8, 8],
});

export const visitedNodeMarker = new Icon({
  iconUrl: "/visitedNode.svg",
  iconSize: [8, 8],
});
