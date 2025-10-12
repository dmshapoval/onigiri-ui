import { computed, inject } from '@angular/core';
import {
  NULL_IMAGE_TILE,
  NULL_LINK_TILE,
  NULL_PREVIEW_TILE,
  NULL_TEXT_TILE,
  NULL_TITLE_TILE,
  PageTile
} from './models';
import { TilesStore } from './tiles.store';
import { PageViewStore } from './view.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';
import { TILE_ID } from './context';

function createUnsafeTileSelector<T extends PageTile>() {
  const tileId = inject(TILE_ID);
  const tilesStore = inject(TilesStore);

  return computed(() => {
    const id = tileId();
    const result = tilesStore.tiles().find(x => x.id === id) || null;

    return <T | null>result;
  });
}

function createSafeTileSelector<T extends PageTile>(onNotFound: T) {
  // tileId = tileId || inject(TILE_ID);
  const tileId = inject(TILE_ID);
  const tilesStore = inject(TilesStore);

  return computed(() => {
    const id = tileId();
    const result = tilesStore.tiles().find(x => x.id === id) || onNotFound;

    return <T>result;
  });
}

export function selectLinkTile() {
  return createSafeTileSelector(NULL_LINK_TILE);
}

export function selectImageTile() {
  return createSafeTileSelector(NULL_IMAGE_TILE);
}

export function selectTextTile() {
  return createSafeTileSelector(NULL_TEXT_TILE);
}

export function selectTitleTile() {
  return createSafeTileSelector(NULL_TITLE_TILE);
}

export function selectPreviewTile() {
  return createSafeTileSelector(NULL_PREVIEW_TILE);
}

// export function createTileTypeSelector(tileId: Signal<string>) {
//   const tilesStore = inject(TilesStore);

//   return computed(() => {
//     const id = tileId();
//     const result = tilesStore.tiles().find(x => x.id === id)!;

//     return result.type;
//   });
// }

export function createTileUpdater<T extends PageTile>() {
  const tilesStore = inject(TilesStore);
  const getTile = createUnsafeTileSelector();

  return rxMethod<Partial<T>>(
    pipe(
      tap(data => {
        const tile = getTile();

        if (tile) {
          tilesStore.updateTile({ ...tile, ...data });
        }
      })
    )
  );
}

// export function createSelectedTileReader() {
//   const viewStore = inject(PageViewStore);
//   const tilesStore = inject(TilesStore);

//   return computed(() => {
//     const tileId = viewStore.selectedTile();
//     const allTiles = tilesStore.tiles();

//     return tileId ? allTiles.find(x => x.id === tileId)! : null;
//   });
// }

// export function createPositionedTileReader(tileId: Signal<string>) {
//   const viewStore = inject(PageViewStore);
//   const tilesStore = inject(TilesStore);

//   return computed(() => {
//     const { desktop, mobile } = tilesStore.positioned();
//     const vt = viewStore.viewType();
//     const id = tileId();

//     const tiles = vt === 'desktop' ? desktop : mobile;

//     return tiles.find(x => x.tileId === id)!;
//   });
// }

export function createTileSizeSelector() {
  const tileId = inject(TILE_ID);
  const viewStore = inject(PageViewStore);
  const tilesStore = inject(TilesStore);

  return computed(() => {
    const { desktop, mobile } = tilesStore.positioned();
    const vt = viewStore.viewType();
    const id = tileId();

    const tiles = vt === 'desktop' ? desktop : mobile;

    const tile = tiles.find(x => x.tileId === id);

    return tile && tile.size ? tile.size : { width: 0, height: 0 };
  });
}

export function readSelectedTile() {
  const tilesStore = inject(TilesStore);
  const viewStore = inject(PageViewStore);

  return computed(() => {
    const viewType = viewStore.viewType();
    const tile = tilesStore.selectedTile();
    const { desktop, mobile } = tilesStore.positioned();

    if (!tile) {
      return null;
    }

    const { size, position } =
      viewType === 'desktop'
        ? desktop.find(x => x.tileId === tile.id)!
        : mobile.find(x => x.tileId === tile.id)!;

    return {
      id: tile.id,
      tile,
      viewConfig: {
        size,
        position
      }
    };
  });
}
