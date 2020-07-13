import Animated_Polyline from "./Leaflet.AnimatedPolyline";
import {
  Polyline as LeafletPolyline,
  LatLng,
  PathOptions,
  PolylineOptions,
} from "leaflet";
import { withLeaflet, Path, MapLayerProps } from "react-leaflet";

type LeafletElement = Animated_Polyline;

type Props = {
  snakeSpeed: number;
  positions: LatLng[];
} & MapLayerProps &
  PolylineOptions &
  PathOptions &
  object;

class AnimatedPolyline extends Path<Props, LeafletElement> {
  public createLeafletElement(props: Props): LeafletElement {
    const el = new Animated_Polyline(props.positions, this.getOptions(props));
    this.contextValue = { ...props.leaflet, popupContainer: el };
    return el;
  }

  public updateLeafletElement(fromProps: Props, toProps: Props) {
    if (
      toProps.positions !== fromProps.positions &&
      toProps.positions.length > 0
    ) {
      this.leafletElement.setSnakeLatLngs(toProps.positions);
      console.log("new:" + toProps.snakeSpeed);
      this.leafletElement.snakeIn(toProps.snakeSpeed);
    }
  }
}

export default withLeaflet(AnimatedPolyline);
