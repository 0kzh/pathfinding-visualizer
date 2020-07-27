export interface nodeInfo {
  lat: number;
  lon: number;
  adj: Array<string>;
}

export interface qtNode {
  key: string;
  lat: number;
  lon: number;
}

export interface LeafletLatLng {
  lat: number;
  lng: number;
}

export interface pair {
  label: string;
  value: string;
}

export interface dataDict {
  [key: string]: nodeInfo;
}

export interface cityDict {
  [key: string]: dataDict;
}
