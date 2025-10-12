import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TilesStore } from '../../../../tiles.store';
import { TILE_ID } from '../../../../context';

@Component({
  standalone: true,
  imports: [],
  selector: 'title-tile-mobile-menu',
  templateUrl: 'mobile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleTileMobileMenuComponent {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);

  onDone() {
    this.#tilesStore.unselectTile();
  }
}
