import {
  patchState,
  signalStore,
  withMethods,
  withState,
  getState,
  withComputed,
  withHooks
} from '@ngrx/signals';
import {
  CreateLinkTileData,
  ImageTile,
  ImageTilePreview,
  isPersistedTile,
  LinkBioPage,
  LinkTile,
  LinkTilePreview,
  PageTile,
  PageViewType,
  PositionedTile,
  PreviewTile,
  TextTile,
  TileDeviceViewConfig,
  TileIdWithViewConfig,
  TilePosition,
  TileSize,
  TileViewConfig,
  TileWithoutViewConfig,
  TitleTile
} from './models';
import { PagesApiService } from '../public-api';
import {
  buildTilesGridFromPageTiles,
  getPositionForNewTile,
  tileViewConfigIsValid,
  updateTileSize
} from './calculations';
import { computed, inject } from '@angular/core';
import { ApiRequestsService } from './api-requests.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { bufferTime, debounceTime, filter, pipe, tap } from 'rxjs';
import { match } from 'ts-pattern';
import { PageEditorMediator } from './mediator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

interface State {
  selectedTileId: string | null;
  tiles: PageTile[];
}
const initState: State = {
  selectedTileId: null,
  tiles: []
};

export type AddTileData =
  | Omit<ImageTile, 'viewConfig'>
  | Omit<TitleTile, 'viewConfig'>
  | Omit<TextTile, 'viewConfig'>
  | Omit<ImageTilePreview, 'viewConfig'>
  | Omit<LinkTilePreview, 'viewConfig'>;

export interface AddTileRequest {
  viewType: PageViewType;
  tile: AddTileData;
  size: TileSize;
}

export interface UpdateTilePositionRequest {
  tileId: string;
  position: TilePosition;
}

export interface UpdateTileSizeRequest {
  tileId: string;
  width: number;
  height: number;
}

export type PositinedTilesState = Record<PageViewType, PositionedTile[]>;

export const TilesStore = signalStore(
  withState(initState),

  withComputed(({ tiles }) => ({
    positioned: computed(() => {
      const all = tiles();

      const { positionedTiles: desktop } = buildTilesGridFromPageTiles(
        all,
        'desktop'
      );
      const { positionedTiles: mobile } = buildTilesGridFromPageTiles(
        all,
        'mobile'
      );

      const result: PositinedTilesState = { desktop, mobile };

      return result;
    })
  })),

  withComputed(({ positioned, selectedTileId, tiles }) => ({
    selectedTile: computed(() => {
      const tileId = selectedTileId();
      return tileId ? tiles().find(x => x.id === tileId)! : null;
    }),

    selectedPositioned: computed(() => {
      const tileId = selectedTileId();
      const all = positioned();
      if (!tileId) {
        return null;
      }

      const desktop = all.desktop.find(x => x.tileId === tileId)!;
      const mobile = all.mobile.find(x => x.tileId === tileId)!;

      return { desktop, mobile };
    })
  })),

  withComputed(({ selectedTile }) => ({
    selectedTileType: computed(() => {
      const tile = selectedTile();

      return tile?.type || null;
    })
  })),

  withMethods(
    (
      store,
      api = inject(PagesApiService),
      requests = inject(ApiRequestsService)
    ) => {
      return {
        setState(page: LinkBioPage) {
          const tiles = page.tiles.filter(x => x.type !== 'preview');
          patchState(store, { tiles });
        },

        unselectTile() {
          patchState(store, { selectedTileId: null });
        },

        addTile({ size, tile, viewType }: AddTileRequest) {
          const { tiles: otherTiles } = getState(store);
          const position = getPositionForNewTile({
            size,
            viewType,
            otherTiles
          });

          const dvc: TileDeviceViewConfig = { size, position };

          const isDesktop = viewType === 'desktop';
          const viewConfig: TileViewConfig = {
            desktop: isDesktop ? dvc : null,
            mobile: isDesktop ? null : dvc
          };

          const pageTile: PageTile = { ...tile, viewConfig };

          if (pageTile.type !== 'preview') {
            requests.send(() => api.addPageTile(pageTile));
          }

          patchState(store, s => ({
            ...s,
            tiles: [...s.tiles, pageTile]
          }));
        },

        replacePreviewTile(tile: PageTile) {
          patchState(store, s => ({
            ...s,
            tiles: s.tiles.map(x => (x.id === tile.id ? tile : x))
          }));

          //requests.send(() => api.addPageTile(tile));
        },

        updateTile(tile: PageTile) {
          patchState(store, s => ({
            ...s,
            tiles: s.tiles.map(x => (x.id === tile.id ? tile : x))
          }));

          this._onTileChanged(tile.id);
        },

        deleteTile(tileId: string) {
          requests.send(() => api.deletePageTile(tileId));

          patchState(store, s => ({
            ...s,
            selectedTileId:
              s.selectedTileId === tileId ? null : s.selectedTileId,
            tiles: s.tiles.filter(x => x.id !== tileId)
          }));
        },

        refreshLinkTileResolvedData(tileId: string) {
          api
            .getLinkTileResolvedData(tileId)
            .pipe(
              tapResponse(
                linkData => {
                  this._updateLinkTile(tileId, { linkData });
                },
                () => {}
              )
            )
            .subscribe();
        },

        refreshLinkTileFavicon(tileId: string) {
          api
            .getLinkTileFavicon(tileId)
            .pipe(
              tapResponse(
                favicon => {
                  this._updateLinkTile(tileId, { favicon });
                },
                () => {}
              )
            )
            .subscribe();
        },

        refreshLinkTileThumbnail(tileId: string) {
          api
            .getLinkTileThumbnail(tileId)
            .pipe(
              tapResponse(
                thumbImage => {
                  this._updateLinkTile(tileId, { thumbImage });
                },
                () => {}
              )
            )
            .subscribe();
        },

        _updateLinkTile(tileId: string, data: Partial<LinkTile>) {
          patchState(store, s => ({
            ...s,
            tiles: s.tiles.map(t =>
              t.id === tileId ? <LinkTile>{ ...t, ...data } : t
            )
          }));
        },

        updateTilePositions(
          reqs: UpdateTilePositionRequest[],
          viewType: PageViewType
        ) {
          this.updateTilesViewConfig(tiles => {
            const { positionedTiles } = buildTilesGridFromPageTiles(
              tiles,
              viewType
            );

            return tiles.map(t => {
              const positioned = positionedTiles.find(x => x.tileId === t.id);
              if (!positioned) {
                return t;
              }

              const fromReq = reqs.find(x => x.tileId === t.id);
              if (!fromReq) {
                return t;
              }

              const updatedTile = updateTileViewConfig(t, viewType, {
                size: positioned.size,
                position: fromReq.position
              });

              return updatedTile;
            });
          });
        },

        updateTileSize(
          { tileId, height, width }: UpdateTileSizeRequest,
          viewType: PageViewType
        ) {
          this.updateTilesViewConfig(tiles => {
            const tile = tiles.find(x => x.id === tileId);

            if (!tile) {
              return tiles;
            }

            const updatedPositions = updateTileSize({
              tile,
              height,
              width,
              viewType,
              otherTiles: tiles.filter(x => x.id !== tileId)
            });

            return tiles.map(t => {
              const fromUpdated = updatedPositions.find(x => x.tileId === t.id);

              if (!fromUpdated) {
                return t;
              }

              return updateTileViewConfig(t, viewType, {
                position: fromUpdated.position,
                size: fromUpdated.size
              });
            });
          });
        },

        updateTilesViewConfig(updater: (tiles: PageTile[]) => PageTile[]) {
          patchState(store, s => {
            const updatedTiles = updater(s.tiles);

            this._sendTileViewConfigUpdates(updatedTiles);

            return { ...s, tiles: updatedTiles };
          });
        },

        _onTileChanged: rxMethod<string>(
          pipe(
            bufferTime(1500),
            filter(x => x.length > 0),
            tap(reqs => {
              const allTiles = getState(store).tiles;
              const tileIds = new Set(reqs);

              for (const tileId of tileIds) {
                const tile = allTiles.find(x => x.id === tileId);
                if (tile && isPersistedTile(tile)) {
                  requests.send(() => api.updateTile(tile));
                }
              }
            })
          )
        ),

        _sendTileViewConfigUpdates: rxMethod<PageTile[]>(
          pipe(
            debounceTime(800),
            tap(tiles => {
              const payload: TileIdWithViewConfig[] = tiles
                .map(t => ({
                  tileId: t.id,
                  viewConfig: t.viewConfig
                }))
                .filter(x => {
                  const isValid = tileViewConfigIsValid(x);
                  if (!isValid) {
                    console.warn(
                      `Config for tile ${x.tileId} is skipped as it is not valid`
                    );
                    console.log(x);
                  }

                  return isValid;
                });

              requests.send(() => api.updateTilesViewConfig(payload));
            })
          )
        )
      };
    }
  ),

  withHooks({
    onInit(store, mediator = inject(PageEditorMediator)) {
      mediator.messages.pipe(takeUntilDestroyed()).subscribe(msg => {
        if (msg._type === 'select_tile') {
          patchState(store, s =>
            s.selectedTileId ? s : { ...s, selectedTileId: msg.tileId }
          );
        }
      });

      // deviceSizeTracking.deviceSize
      //   .pipe(
      //     map(w => w < 1170),
      //     distinctUntilChanged(),
      //     takeUntilDestroyed()
      //   )
      //   .subscribe(onMobileDevice => {
      //     patchState(store, { onMobileDevice });
      //   });
    }
  })
);

function updateTileViewConfig(
  tile: PageTile,
  viewType: PageViewType,
  vc: TileDeviceViewConfig
): PageTile {
  const viewConfig = match(viewType)
    .with('mobile', () => ({ ...tile.viewConfig, mobile: vc }))
    .with('desktop', () => ({ ...tile.viewConfig, desktop: vc }))
    .otherwise(() => tile.viewConfig);

  return { ...tile, viewConfig };
}
