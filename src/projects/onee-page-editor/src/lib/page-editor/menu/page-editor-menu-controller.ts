import { computed, inject, Injectable, signal } from '@angular/core';
import { PageViewStore } from '../../view.store';
import { TilesStore } from '../../tiles.store';

type MenuMode = 'add_tile' | 'appearance' | 'tile-view';

@Injectable()
export class PageEditorMenuController {
  viewStore = inject(PageViewStore);
  tilesStore = inject(TilesStore);

  #selectedMode = signal<MenuMode>('add_tile');

  #calculatedMode = computed(() => {
    const onMobile = this.viewStore.onMobileDevice();
    const selectedTile = this.tilesStore.selectedTileId();
    const result: MenuMode | null =
      onMobile && selectedTile ? 'tile-view' : null;

    return result;
  });

  mode = computed(() => {
    const selected = this.#selectedMode();
    const calculated = this.#calculatedMode();

    if (calculated) {
      return calculated;
    }

    return calculated || selected;
  });

  setMode(mode: MenuMode) {
    this.#selectedMode.set(mode);
  }
}
