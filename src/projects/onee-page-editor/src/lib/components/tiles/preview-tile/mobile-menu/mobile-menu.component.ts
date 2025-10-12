import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { TilesStore } from '../../../../tiles.store';
import { PageViewStore } from '../../../../view.store';
import { OnigiriIconComponent } from '@oni-shared';
import { readSelectedTile } from '../../../../selectors';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'preview-tile-mobile-menu',
  templateUrl: 'mobile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewTileMobileMenuComponent implements OnInit {
  #tilesStore = inject(TilesStore);
  #viewStore = inject(PageViewStore);

  #selectedTile = readSelectedTile();

  selectedSize = computed(() => {
    return this.#selectedTile()?.viewConfig.size || null;
  });

  ngOnInit() {}

  updateTileSize(width: number, height: number) {
    const tileId = this.#selectedTile()?.id;
    const viewType = this.#viewStore.viewType();

    if (!tileId) {
      return;
    }

    this.#tilesStore.updateTileSize({ tileId, height, width }, viewType);
  }

  onDone() {
    this.#tilesStore.unselectTile();
  }
}
