import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { TilesStore } from '../../../../tiles.store';
import { PageViewStore } from '../../../../view.store';
import { OnigiriIconComponent } from '@oni-shared';
import { createTileSizeSelector } from '../../../../selectors';
import { TILE_ID } from '../../../../context';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'link-tile-mobile-menu',
  templateUrl: 'mobile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileMobileMenuComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);
  #viewStore = inject(PageViewStore);

  tileSize = createTileSizeSelector();

  ngOnInit() {}

  updateTileSize(width: number, height: number) {
    const viewType = this.#viewStore.viewType();
    const tileId = this.tileId();

    this.#tilesStore.updateTileSize({ tileId, height, width }, viewType);
  }

  onDone() {
    this.#tilesStore.unselectTile();
  }
}
