import {
  Polyline as LeafletPolyline,
  LatLngExpression,
  PolylineOptions,
  LatLng,
} from "leaflet";

if (typeof window.exports != "object") {
  //cdn usage on browsers without "exports" variable
  window.exports = {};
}

// constructor type
type ConstPolyline = new (...args: any[]) => LeafletPolyline;
// needed leaflet type
type LeafletType = {
  Polyline: ConstPolyline;
  LineUtil: any;
  Util: any;
};
declare global {
  interface Window {
    Animated_Polyline: any;
    exports: Object;
    L: LeafletType;
  }
}

let Leaflet_module = window.L ? window.L : (require("leaflet") as LeafletType);

class Animated_Polyline extends Leaflet_module.Polyline {
  // Hi-res timestamp indicating when the last calculations for vertices and
  // distance took place.
  private _snakingTimestamp = 0;

  // How many rings and vertices we've already visited
  // Yeah, yeah, "rings" semantically only apply to polygons, but L.Polyline
  // internally uses that nomenclature.
  private _snakingRings = 0;
  private _snakingVertices = 0;

  // Distance to draw (in screen pixels) since the last vertex
  private _snakingDistance = 0;

  // Flag
  private _snaking = false;
  private _snakingTime = performance.now();
  private _snakeSpeed = 200;
  private _snakeLatLngs: any;

  /// TODO: accept a 'map' parameter, fall back to addTo() in case
  /// performance.now is not available.
  snakeIn = (snakeSpeed: number) => {
    if (this._snakeLatLngs.length == 0) return;
    if (this._snaking) {
      return;
    }

    if (
      !("performance" in window) ||
      !("now" in window.performance) ||
      !this._map
    ) {
      return;
    }

    this._snaking = true;
    this._snakeSpeed = snakeSpeed;
    this._snakingTime = performance.now();
    this._snakingVertices = this._snakingRings = this._snakingDistance = 0;

    if (!this._snakeLatLngs) {
      this._snakeLatLngs = Leaflet_module.LineUtil.isFlat(this.getLatLngs())
        ? [this.getLatLngs()]
        : this.getLatLngs();
    }

    // Init with just the first (0th) vertex in a new ring
    // Twice because the first thing that this._snake is is chop the head.
    this.setLatLngs([[this._snakeLatLngs[0][0], this._snakeLatLngs[0][0]]]);
    this._snake();
    this.fire("snakestart");
    return this;
  };

  setSnakeLatLngs = (latlngs: LatLngExpression[] | LatLngExpression[][]) => {
    this._snakeLatLngs = Leaflet_module.LineUtil.isFlat(latlngs)
      ? [latlngs]
      : latlngs;
  };

  _snake = () => {
    var now = performance.now();
    var diff = now - this._snakingTime; // In milliseconds
    // TODO: change
    var forward = (diff * this._snakeSpeed) / 1000; // In pixels
    this._snakingTime = now;

    // Chop the head from the previous frame
    const prev = this.getLatLngs()[this._snakingRings];
    if (Array.isArray(prev)) {
      prev.pop();
      this.setLatLngs(prev);
    }

    return this._snakeForward(forward);
  };

  _snakeForward(forward: number): any {
    // If polyline has been removed from the map stop _snakeForward
    if (!this._map) return;
    // Calculate distance from current vertex to next vertex
    var currPoint = this._map.latLngToContainerPoint(
      this._snakeLatLngs[this._snakingRings][this._snakingVertices]
    );
    var nextPoint = this._map.latLngToContainerPoint(
      this._snakeLatLngs[this._snakingRings][this._snakingVertices + 1]
    );

    var distance = currPoint.distanceTo(nextPoint);

    // 		console.log('Distance to next point:', distance, '; Now at: ', this._snakingDistance, '; Must travel forward:', forward);
    // 		console.log('Vertices: ', this._latlngs);

    if (this._snakingDistance + forward > distance) {
      // Jump to next vertex
      this._snakingVertices++;
      const prev = this.getLatLngs()[this._snakingRings];
      if (Array.isArray(prev)) {
        prev.push(
          this._snakeLatLngs[this._snakingRings][this._snakingVertices]
        );
        this.setLatLngs(prev);
      }

      if (
        this._snakingVertices >=
        this._snakeLatLngs[this._snakingRings].length - 1
      ) {
        if (this._snakingRings >= this._snakeLatLngs.length - 1) {
          return this._snakeEnd();
        } else {
          this._snakingVertices = 0;
          this._snakingRings++;
          this.setLatLngs([
            this._snakeLatLngs[this._snakingRings][this._snakingVertices],
          ]);
        }
      }

      this._snakingDistance -= distance;
      return this._snakeForward(forward);
    }

    this._snakingDistance += forward;

    var percent = this._snakingDistance / distance;

    var headPoint = nextPoint
      .multiplyBy(percent)
      .add(currPoint.multiplyBy(1 - percent));

    // Put a new head in place.
    var headLatLng = this._map.containerPointToLatLng(headPoint);
    this.addLatLng(headLatLng);
    Leaflet_module.Util.requestAnimFrame(this._snake, this);
  }

  _snakeEnd = () => {
    this.setLatLngs(this._snakeLatLngs);
    this._snaking = false;
    this.fire("snakeend");
  };
}

window.Animated_Polyline = Animated_Polyline;

export default Animated_Polyline;
