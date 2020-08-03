import React from "react";
import { hasKey } from "../utils";
import { Marker } from "react-leaflet";
import { nodeMarker } from "../Icons";
import { nodeInfo, dataDict } from "../types";
import CanvasMarkersLayer from "../lib/react-leaflet-canvas-markers/CanvasMarkersLayer";

interface Props {
  nodeData: dataDict;
  nodes: Set<string>;
}

const PathfindingMarkers: React.FC<Props> = ({ nodeData, nodes }) => {
  return (
    <CanvasMarkersLayer>
      {Array.from(nodes).map((node: string) => {
        if (hasKey(nodeData, node)) {
          const val: nodeInfo = nodeData[node];
          return (
            <Marker
              key={node}
              position={[val.lat, val.lon]}
              icon={nodeMarker}
            />
          );
        }
        return null;
      })}
    </CanvasMarkersLayer>
  );
};

const areEqual = (prevProps: Props, nextProps: Props) => {
  return false;
};

export default React.memo((props) => {
  return PathfindingMarkers(props);
}, areEqual);
