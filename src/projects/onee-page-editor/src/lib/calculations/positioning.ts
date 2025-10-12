import {
  PageTile, PageViewType, PositionedTile,
  TilePosition, TileSize
} from "../models";
import * as A from 'fp-ts/es6/Array';
import * as NA from 'fp-ts/es6/NonEmptyArray';
import * as Eq from 'fp-ts/es6/Eq';
import { pipe } from 'fp-ts/es6/function';
import {
  GridArea, TilesGrid, createGridAreaValidator,
  createSizeReader, getMaxColumnsForView, getTileGridArea
} from "./common";
import {
  buildTilesGridFromPageTiles,
  buildTilesGridFromPositionedTiles, getNextEmptyCellPosition, isGridAreaFree
} from "./tiles-grid";

export function getPositionForNewTile(params: {
  viewType: PageViewType;
  size: TileSize;
  otherTiles: PageTile[];
}) {

  const { otherTiles, viewType, size } = params;
  const { grid } = buildTilesGridFromPageTiles(otherTiles, viewType);
  const position = getNextEmptyCellPosition({ grid, size, viewType });

  return position;
}

export function updateTileSize(params: {
  viewType: PageViewType;
  tile: PageTile;
  width: number;
  height: number;
  otherTiles: PageTile[];
}): PositionedTile[] {

  const {
    tile,
    otherTiles,
    viewType,
    height: newHeight,
    width: newWidth } = params;

  const getCurrentSize = createSizeReader(viewType);
  const currentSize = getCurrentSize(tile);
  const newSize: TileSize = { width: newWidth, height: newHeight };
  const resizedTileId = tile.id;

  const { positionedTiles } = buildTilesGridFromPageTiles([...otherTiles, tile], viewType);
  const positionedTile = positionedTiles.find(x => x.tileId === resizedTileId)!;

  const increasingWidth = currentSize.width < newWidth;
  const increasingHeight = currentSize.height < newHeight;

  if (!increasingWidth && !increasingHeight) {
    return positionedTiles
      .map(t => t.tileId === resizedTileId ? { ...t, size: newSize } : t);
  }

  const gridWithoutResizedTile = buildTilesGridFromPositionedTiles(
    positionedTiles.filter(x => x.tileId !== resizedTileId),
    viewType
  )

  // check if it is possible to place tile without additional shifts
  // simply placing it within existion free space around current position
  let newPosition = tryGetFreePositionAround({
    viewType,
    grid: gridWithoutResizedTile,
    newSize: newSize,
    tile: positionedTile,
  });

  if (newPosition) {
    return positionedTiles
      .map(t => t.tileId === tile.id ? { ...t, size: newSize, position: newPosition! } : t);
  }

  // in case of increasing width
  // check if it is possible to move tile along x-axis in the current row
  // ignoring that heigh collides otherwise take existing position 
  // and simply pushing tiles below.

  newPosition = increasingWidth
    ? getNewPositionInTheCurrentRow({
      newSize, viewType,
      grid: gridWithoutResizedTile,
      tile: positionedTile,
    })
    : positionedTile.position;

  const newGridArea = getTileGridArea(newPosition, newSize);
  const updatedTiles = freeGridAreaForTile({
    viewType,
    area: newGridArea,
    otherTiles: positionedTiles.filter(x => x.tileId !== tile.id)
  });

  const updatedTile: PositionedTile = { ...positionedTile, position: newPosition, size: newSize };


  return [...updatedTiles, updatedTile];
}

// Here we're trying to find some start position in the current row 
// nearby start column. Height here doesn't checked
// if there is no completely free area in the row we
// take the first closest
function getNewPositionInTheCurrentRow(params: {
  viewType: PageViewType;
  grid: TilesGrid;
  tile: PositionedTile;
  newSize: TileSize
}) {
  const { viewType, tile, newSize, grid } = params;
  const { width } = newSize;
  const { row, column: curCol } = tile.position;

  const colsToWest = NA.range(curCol - width + 1, curCol);
  const colsToEast = NA.range(curCol, curCol + width - 1);

  const byDistanceFromCurrentColumn = (c1: number, c2: number) => {
    const c1Dist = Math.abs(c1 - curCol);
    const c2Dist = Math.abs(c2 - curCol);

    return c1Dist - c2Dist;
  };

  const maxColumn = getMaxColumnsForView(viewType);
  const isGridAreaValid = createGridAreaValidator(viewType);

  const columns = pipe(
    colsToWest.concat(colsToEast),
    A.filter(c => c > 0 && c <= maxColumn),
    A.uniq<number>(Eq.eqStrict),
  ).sort(byDistanceFromCurrentColumn);


  const size: TileSize = { width, height: 1 };

  const positionsWithAreas = columns
    .map(column => ({ row, column }))
    .map(position => ({ position, area: getTileGridArea(position, size) }))
    .filter(x => isGridAreaValid(x.area))
    ;

  const freePosition = positionsWithAreas
    .find(x => isGridAreaFree(x.area, grid))?.position;

  return freePosition || positionsWithAreas[0].position;
}

function freeGridAreaForTile(params: {
  area: GridArea;
  viewType: PageViewType;
  otherTiles: PositionedTile[];
}): PositionedTile[] {

  const { area, viewType, otherTiles } = params;
  let grid = buildTilesGridFromPositionedTiles(otherTiles, viewType);

  // if area is already free we simply return current tiles state
  if (isGridAreaFree(area, grid)) {
    return otherTiles;
  }

  const { startRow, startCol, endRow, endCol } = area;

  let tilesState = otherTiles;

  // moving through area and pushing all neccessary tiles dowm
  NA.range(startRow, endRow).forEach(r => {
    NA.range(startCol, endCol)
      .forEach(col => {

        grid = buildTilesGridFromPositionedTiles(tilesState, viewType);
        const row = grid[r - 1]!; // grid has extra free rows reservations

        const tileId = row[col - 1];

        // if empty no additional actions needed as cell is empty
        if (!tileId) { return; }

        // otherwise push tile down
        const tile = tilesState.find(x => x.tileId === tileId);

        if (!tile) {
          throw new Error('Tile was not found')
        }

        tilesState = pushTileToSouth({
          tile, viewType,
          otherTiles: tilesState.filter(x => x.tileId !== tileId)
        });
      });
  });

  return tilesState;
}

function pushTileToSouth(params: {
  tile: PositionedTile,
  viewType: PageViewType;
  otherTiles: PositionedTile[]
}) {

  // console.log(`Pushing tile ${tile.id} to south`);

  const { otherTiles, tile, viewType } = params;
  const currentArea = getTileGridArea(tile.position, tile.size)
  const areaAfterPush: GridArea = {
    ...currentArea,
    startRow: currentArea.startRow + 1,
    endRow: currentArea.endRow + 1
  };

  const updatedTilesState = freeGridAreaForTile({
    area: areaAfterPush,
    viewType,
    otherTiles
  });

  const updatedTile: PositionedTile = {
    ...tile,
    position: {
      column: tile.position.column,
      row: tile.position.row + 1
    }
  };

  // console.log(`Finished pushing tile ${tile.id} to south`);

  return [...updatedTilesState, updatedTile];
}

function tryGetFreePositionAround(params: {
  viewType: PageViewType;
  grid: TilesGrid;
  tile: PositionedTile;
  newSize: TileSize
}) {
  const { grid, newSize: size, tile, viewType } = params;
  const { height, width } = size;
  const isGridAreaValid = createGridAreaValidator(viewType);
  const positionsAround = getPositionOptionsAround(tile, width, height);


  return positionsAround
    .map(position => ({ position, area: getTileGridArea(position, size) }))
    .find(x => isGridAreaValid(x.area) && isGridAreaFree(x.area, grid))?.position;
}


function getPositionOptionsAround(tile: PositionedTile, newWidth: number, newHeight: number): TilePosition[] {
  const currentPosition = tile.position;
  const { column: curCol, row: curRow } = currentPosition;

  const increasingWidth = tile.size.width < newWidth;
  const increasingHeight = tile.size.height < newHeight;

  // if tile shrinks return without calculations
  if (!increasingWidth && !increasingHeight) {
    return [currentPosition];
  }

  const rowsToNorth = NA.range(curRow - newHeight + 1, curRow).sort();
  const rowsToSouth = NA.range(curRow, curRow + newHeight - 1);
  const colsToWest = NA.range(curCol - newWidth + 1, curCol);
  const colsToEast = NA.range(curCol, curCol + newWidth - 1);

  const result: TilePosition[] = [];

  if (increasingWidth && increasingHeight) {
    const allRows = pipe(rowsToNorth.concat(rowsToSouth), A.uniq<number>(Eq.eqStrict));
    const allCols = pipe(colsToEast.concat(colsToWest), A.uniq<number>(Eq.eqStrict));

    result.push(...allRows.flatMap(
      row => allCols.map(column => ({ row, column }))
    ));

  } else if (increasingWidth) {

    const allCols = pipe(colsToEast.concat(colsToWest), A.uniq<number>(Eq.eqStrict));
    result.push(...allCols.map(column => ({ column, row: curRow })));

  } else if (increasingHeight) {

    const allRows = pipe(rowsToNorth.concat(rowsToSouth), A.uniq<number>(Eq.eqStrict));
    result.push(...allRows.map(row => ({ row, column: curCol })));

  }

  const byDistanceFromCurrentPosition = (p1: TilePosition, p2: TilePosition) => {
    const p1Dist = Math.abs(p1.row - curRow) + Math.abs(p1.column - curCol);
    const p2Dist = Math.abs(p2.row - curRow) + Math.abs(p2.column - curCol);

    return p1Dist - p2Dist;
  }

  return result
    .filter(p => p.column > 0 && p.column <= 4 && p.row > 0)
    .sort(byDistanceFromCurrentPosition);
}





