import {
  PageTile,
  PageViewType, PositionedTile,
  TilePosition, TileSize
} from "../models";
import * as Reader from 'fp-ts/es6/Reader';
import sum from 'lodash/sum';
import { isNil } from '@oni-shared';
import * as A from 'fp-ts/es6/Array';
import * as NA from 'fp-ts/es6/NonEmptyArray';
import { pipe } from 'fp-ts/es6/function';
import {
  GridArea, TilesGrid, createGridAreaValidator,
  createPositionReader, createSizeReader,
  getMaxColumnsForView, getTileGridArea, sortTiles
} from "./common";

export function buildTilesGridFromPageTiles(tiles: PageTile[], viewType: PageViewType) {
  const configuredForView: PositionedTile[] = [];
  const notConfiguredForView: PageTile[] = [];
  const positionedTiles: PositionedTile[] = [];

  const getPosition = createPositionReader(viewType);
  const getSize = createSizeReader(viewType);

  sortTiles(tiles, viewType).forEach(tile => {
    const tileId = tile.id;
    const position = getPosition(tile);

    if (position) {
      configuredForView.push({ tileId, position, size: getSize(tile) });
    } else {
      notConfiguredForView.push(tile);
    }
  });

  const grid = createEmptyTilesGridFromPageTiles(tiles, viewType);

  // place configured 
  configuredForView
    .forEach(t => {
      positionedTiles.push(t);
      reserveAreaOnGrid(grid, t.tileId, t.position, t.size);
    });

  // place not configured
  notConfiguredForView.forEach(tile => {
    const size = getSize(tile);
    const position = getNextEmptyCellPosition({ grid, size, viewType });

    positionedTiles.push({ tileId: tile.id, position, size });
    reserveAreaOnGrid(grid, tile.id, position, size);
  });

  return { grid, positionedTiles };
}

export function buildTilesGridFromPositionedTiles(tiles: PositionedTile[], viewType: PageViewType) {
  const grid = createEmptyTilesGridFromPositionedTiles(tiles, viewType);

  tiles.forEach(t => {
    reserveAreaOnGrid(grid, t.tileId, t.position, t.size);
  });

  return grid;
}

export function getNextEmptyCellPosition(params: {
  viewType: PageViewType;
  grid: TilesGrid;
  size: TileSize;
}): TilePosition {

  const { grid, size, viewType } = params;
  const maxCol = getMaxColumnsForView(viewType);


  const isGridAreaValid = createGridAreaValidator(viewType);

  for (let row = 1; row <= grid.length; row++) {
    for (let column = 1; column <= maxCol; column++) {
      const position: TilePosition = { row, column };

      const area = getTileGridArea(position, size)
      if (isGridAreaValid(area) && isGridAreaFree(area, grid)) {
        return position;
      }
    }
  }

  return {
    column: 1,
    row: grid.length + 1
  }
}

export function isGridAreaFree(area: GridArea, grid: TilesGrid) {

  const { startRow, startCol, endRow, endCol } = area;

  const rows = NA.range(startRow, endRow)
    .map(row => grid[row - 1]);

  return NA.range(startCol, endCol)
    .every(c => rows.every(r => r.length >= c && isNil(r[c - 1])))
}

// export function removeEmptyRows(grid: TilesGrid) {
//   const isNotEmptyRow = (row: Array<string| null>) => {
//     return row.some(isNotNil);
//   } 

//   return grid.filter(isNotEmptyRow)
// }

type EmptyRowReader = Reader.Reader<void, Array<string | null>>;
function createEmptyRowReader(viewType: PageViewType): EmptyRowReader {
  const rangeEnd = getMaxColumnsForView(viewType) - 1;
  return viewType === 'desktop'
    ? () => NA.range(0, rangeEnd).map(_ => null)
    : () => NA.range(0, rangeEnd).map(_ => null);
}

function createEmptyTilesGridFromPageTiles(tiles: PageTile[], viewType: PageViewType) {
  const getSize = createSizeReader(viewType);
  const createEmptyRow = createEmptyRowReader(viewType);

  const totalHeight = pipe(
    tiles, A.map(getSize), A.map(x => x.height), sum);

  const maxRows = totalHeight + 100; // extra 100 rows reservation to simplify calculations

  const result = NA.range(0, maxRows - 1).map(() => createEmptyRow());

  return result;
}

function createEmptyTilesGridFromPositionedTiles(tiles: PositionedTile[], viewType: PageViewType) {
  const createEmptyRow = createEmptyRowReader(viewType);

  const totalHeight = pipe(
    tiles, A.map(x => x.size), A.map(x => x.height), sum);

  const maxRows = totalHeight + 100; // extra 100 rows reservation to simplify calculations

  const result = NA.range(0, maxRows - 1).map(() => createEmptyRow());

  return result;
}

// TODO: consider immutable flow
function reserveAreaOnGrid(grid: TilesGrid, tileId: string, position: TilePosition, size: TileSize) {
  const { column: startCol, row: startRow } = position;
  const tRowEnd = startRow + size.height - 1;
  const tColEnd = startCol + size.width - 1;

  for (let cellRow = startRow; cellRow <= tRowEnd; cellRow++) {
    let row = grid[cellRow - 1];

    for (let cellCol = startCol; cellCol <= tColEnd; cellCol++) {
      row[cellCol - 1] = tileId;
    }
  }
}



