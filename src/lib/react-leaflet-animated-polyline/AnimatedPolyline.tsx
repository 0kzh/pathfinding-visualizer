import Animated_Polyline from "./Leaflet.AnimatedPolyline";
import {
  Polyline as LeafletPolyline,
  LatLng,
  PathOptions,
  PolylineOptions,
} from "leaflet";
import { withLeaflet, Path, MapLayerProps } from "react-leaflet";

type LeafletElement = LeafletPolyline | Animated_Polyline;

type PolylineProps = {
  positions: LatLng[];
} & MapLayerProps &
  PolylineOptions &
  PathOptions &
  object;

class AnimatedPolyline extends Path<PolylineProps, LeafletElement> {
  public createLeafletElement(props: PolylineProps): LeafletElement {
    const el = new Animated_Polyline(props.positions, this.getOptions(props));
    this.contextValue = { ...props.leaflet, popupContainer: el };
    return el;
  }

  public updateLeafletElement(
    fromProps: PolylineProps,
    toProps: PolylineProps
  ) {
    if (
      toProps.positions !== fromProps.positions &&
      toProps.positions.length > 0 &&
      this.leafletElement instanceof Animated_Polyline
    ) {
      this.leafletElement.setSnakeLatLngs(toProps.positions);
      this.leafletElement.snakeIn();
    }
  }
}

export default withLeaflet(AnimatedPolyline);
