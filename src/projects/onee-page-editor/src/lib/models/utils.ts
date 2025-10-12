import { TilePosition, TileSize, TileViewConfig } from "./tiles";

export const LAYOUT_CONSTANTS = {
  desktop: { columns: 4 },
  mobile: { columns: 2 }
};

export type PageViewType = "desktop" | "mobile";

export interface TileIdWithViewConfig {
  tileId: string;
  viewConfig: TileViewConfig;
}

export interface PositionedTile {
  tileId: string;
  size: TileSize;
  position: TilePosition;
}
