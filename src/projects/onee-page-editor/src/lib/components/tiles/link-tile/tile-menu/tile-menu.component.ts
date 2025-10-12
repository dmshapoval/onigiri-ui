import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit
} from '@angular/core';
import { TILE_ID } from '../../../../context';
import { TilesStore } from '../../../../tiles.store';
import { PageViewStore } from '../../../../view.store';
import { createTileSizeSelector } from '../../../../selectors';
import { OnigiriIconComponent } from '@oni-shared';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'link-tile-menu',
  templateUrl: 'tile-menu.component.html',
  styleUrl: 'tile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileMenuComponent implements OnInit {
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

  onDeleteTile() {
    this.#tilesStore.deleteTile(this.tileId());
  }
}
