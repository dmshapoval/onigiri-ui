export interface HasId {
  id: string;
}

export interface TileDeviceViewConfig {
  position: TilePosition;
  size: TileSize;
}

export interface TileSize {
  width: number;
  height: number;
}

export interface TilePosition {
  column: number;
  row: number;
}

export interface TileViewConfig {
  mobile: TileDeviceViewConfig | null;
  desktop: TileDeviceViewConfig | null;
}

export interface HasViewConfig {
  viewConfig: TileViewConfig;
}
