import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { TilesStore } from '../../../../tiles.store';
import { PageViewStore } from '../../../../view.store';
import { OnigiriIconComponent } from '@oni-shared';
import {
  createTileSizeSelector,
  readSelectedTile
} from '../../../../selectors';
import { TILE_ID } from '../../../../context';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'image-tile-mobile-menu',
  templateUrl: 'mobile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageTileMobileMenuComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);
  #viewStore = inject(PageViewStore);

  #selectedTile = readSelectedTile();

  tileSize = createTileSizeSelector();

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
