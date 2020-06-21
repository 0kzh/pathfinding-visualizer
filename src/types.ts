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

export interface pair {
  label: string;
  value: string;
}
