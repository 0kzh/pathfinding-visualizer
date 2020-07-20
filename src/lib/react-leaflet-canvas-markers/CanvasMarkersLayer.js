import PropTypes from "prop-types";
import { MapLayer, withLeaflet } from "react-leaflet";
import L from "leaflet";
import { isEqual } from "lodash";
import "./leaflet.canvas-markers";

const getType = (ob) => {
  if (ob instanceof Array) {
    return "array";
  }
  if (typeof ob === "object") {
    return "object";
  }
  return typeof ob;
};

class CanvasMarkersLayer extends MapLayer {
  static propTypes = {
    children: PropTypes.node,
    options: PropTypes.shape({}),
    onMarkerClick: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    options: {},
    onMarkerClick: () => {},
  };

  createLeafletElement(props) {
    const el = L.canvasIconLayer(props.options || props);
    this.contextValue = {
      ...props.leaflet,
      layerContainer: el,
      popupContainer: el,
    };
    return el;
  }

  updateLeafletElement(fromProps, toProps) {
    // console.log('object fromProps toProps', fromProps, toProps);
    if (this.checkProsEqual(fromProps.children, toProps.children)) {
      return;
    }
    this.leafletElement.redraw();
  }

  componentDidMount() {
    super.componentDidMount();
    this.initEventListeners(this.leafletElement);
    /* eslint-disable no-underscore-dangle */
    this.leafletElement._reset();
  }

  initEventListeners(layer) {
    layer.addOnClickListener((event, marker) => {
      this.props.onMarkerClick(event, marker);
      if (marker._popup) {
        marker._popup.setLatLng(marker._latlng).openOn(layer._map);
      }
    });
  }

  checkProsEqual(from, to) {
    if (!from && !to) {
      return true;
    }
    const dataKey = this.props.dataKey || "position";
    // console.log(dataKey);
    if (
      (getType(from) !== "array" && getType(to) !== "object") ||
      (getType(from) !== "object" && getType(to) !== "array")
    ) {
      return false;
    }
    if (getType(from) === "object" && getType(to) === "object") {
      return isEqual(from.props[dataKey], to.props[dataKey]);
    }
    if (from.length !== to.length) {
      return false;
    }
    const isNotEqual = from.dataKey !== to.dataKey;
    return !isNotEqual;
  }
}

export default withLeaflet(CanvasMarkersLayer);
