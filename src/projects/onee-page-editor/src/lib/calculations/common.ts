import {
  LAYOUT_CONSTANTS,
  PageTile,
  PageViewType,
  TileIdWithViewConfig,
  TilePosition,
  TileSize
} from "../models";
import { groupBy, isNotNil, isNil } from "@oni-shared";
import * as Reader from "fp-ts/es6/Reader";
import * as A from "fp-ts/es6/Array";
import { pipe } from "fp-ts/es6/function";

export interface GridArea {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export type TilesGrid = Array<Array<string | null>>;

type PositionReader = Reader.Reader<PageTile, TilePosition | null>;
type SizeReader = Reader.Reader<PageTile, TileSize>;

type GridAreaValidator = Reader.Reader<GridArea, boolean>;

export function getMaxColumnsForView(viewType: PageViewType) {
  return viewType === "desktop"
    ? LAYOUT_CONSTANTS.desktop.columns
    : LAYOUT_CONSTANTS.mobile.columns;
}

export function createPositionReader(viewType: PageViewType): PositionReader {
  const forDesktop = viewType === "desktop";

  return forDesktop
    ? t => t.viewConfig.desktop?.position || null
    : t => t.viewConfig.mobile?.position || null;
}

export function createSizeReader(viewType: PageViewType): SizeReader {
  return tile => {
    const forDesktop = viewType === "desktop";

    if (tile.type === "title") {
      return {
        width: forDesktop ? 4 : 2,
        height: 1
      };
    }

    const desktopSize = tile.viewConfig.desktop?.size;
    const mobileSize = tile.viewConfig.mobile?.size;

    // 1. Take configured if exist
    const configuredForView = forDesktop ? desktopSize : mobileSize;
    if (configuredForView) {
      return configuredForView;
    }

    // 2. return adjusted alternative
    const alternativeViewSize = forDesktop ? mobileSize : desktopSize;

    if (!alternativeViewSize) {
      throw new Error("Neither desktop nor mobile size were found");
    }

    return forDesktop
      ? alternativeViewSize
      : adjustDesktopSizeToMobile(alternativeViewSize);
  };
}

export function createGridAreaValidator(
  viewType: PageViewType
): GridAreaValidator {
  const maxColumn = getMaxColumnsForView(viewType);

  return area => {
    const { endCol, endRow, startCol, startRow } = area;

    const rowsAreValid = startRow > 0 && endRow > 0 && startRow <= endRow;
    const colsAreValid =
      startCol > 0 &&
      startCol <= maxColumn &&
      endCol > 0 &&
      endCol <= maxColumn &&
      startCol <= endCol;

    return rowsAreValid && colsAreValid;
  };
}

function adjustDesktopSizeToMobile(size: TileSize): TileSize {
  const { height, width } = size;
  return {
    height,
    width: Math.min(width, 2)
  };
}

export function sortTiles(tiles: PageTile[], viewType: PageViewType) {
  const getPosition = createPositionReader(viewType);
  const getAltViewPosition = createPositionReader(
    viewType === "desktop" ? "mobile" : "desktop"
  );

  const processed = tiles.map(tile => {
    const positionForView = getPosition(tile);
    const altViewPosition = getAltViewPosition(tile);

    return {
      tile,
      isConfiguredForView: isNotNil(positionForView),

      row: positionForView?.row || null,
      column: positionForView?.column || null,

      altViewRow: altViewPosition?.row || null,
      altViewColumn: altViewPosition?.column || null
    };
  });

  const configuredForView = pipe(
    processed,
    A.filter(x => x.isConfiguredForView),
    v => groupBy(v, x => x.row!),
    groupedByRows => {
      return Array.from(groupedByRows.entries())
        .map(x => ({ row: x[0], tiles: x[1] }))
        .sort((x, y) => x.row - y.row)
        .map(row => row.tiles.sort((x, y) => x.column! - y.column!))
        .flat();
    }
  );

  const notConfiguredForView = pipe(
    processed,
    A.filter(x => !x.isConfiguredForView),
    v => groupBy(v, x => x.altViewRow!),
    groupedByRows => {
      return Array.from(groupedByRows.entries())
        .map(x => ({ row: x[0], tiles: x[1] }))
        .sort((x, y) => x.row - y.row)
        .map(row =>
          row.tiles.sort((x, y) => x.altViewColumn! - y.altViewColumn!)
        )
        .flat();
    }
  );

  const result = [
    ...configuredForView.map(x => x.tile),
    ...notConfiguredForView.map(x => x.tile)
  ];

  return result;
}

export function getTileGridArea(
  position: TilePosition,
  size: TileSize
): GridArea {
  return {
    startRow: position.row,
    endRow: position.row + size.height - 1,
    startCol: position.column,
    endCol: position.column + size.width - 1
  };
}

export function tileViewConfigIsValid(data: TileIdWithViewConfig) {
  const { desktop, mobile } = data.viewConfig;
  const desktopIsValid =
    isNil(desktop) ||
    pipe(
      getTileGridArea(desktop.position, desktop.size),
      createGridAreaValidator("desktop")
    );

  const mobileIsValid =
    isNil(mobile) ||
    pipe(
      getTileGridArea(mobile.position, mobile.size),
      createGridAreaValidator("mobile")
    );

  return desktopIsValid && mobileIsValid;
}
