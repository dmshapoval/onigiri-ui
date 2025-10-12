import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core';
import {
  ImageTileMobileMenuComponent,
  LinkTileMobileMenuComponent,
  PreviewTileMobileMenuComponent,
  TextTileMobileMenuComponent,
  TitleTileMobileMenuComponent
} from '../../../components';
import { TilesStore } from '../../../tiles.store';
import { readSelectedTile } from '../../../selectors';
import { match } from 'ts-pattern';
import { NgComponentOutlet } from '@angular/common';
import { TILE_ID } from '../../../context';

@Component({
  standalone: true,
  imports: [NgComponentOutlet],
  selector: 'edit-tile-menu',
  templateUrl: 'edit-tile-menu.component.html',
  styleUrl: 'edit-tile-menu.component.scss',
  providers: [
    {
      provide: TILE_ID,
      useFactory: (cmp: EditTileMenuComponent) => cmp.tileId,
      deps: [EditTileMenuComponent]
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTileMenuComponent {
  tilesStore = inject(TilesStore);

  selectedTile = readSelectedTile();
  tileId = computed(() => this.selectedTile()?.id || '');

  tileMenu = computed(() => {
    const tile = this.selectedTile();

    if (!tile) {
      return null;
    }

    return match(tile.tile.type)
      .with('text', () => TextTileMobileMenuComponent)
      .with('image', () => ImageTileMobileMenuComponent)
      .with('preview', () => PreviewTileMobileMenuComponent)
      .with('title', () => TitleTileMobileMenuComponent)
      .with('link', () => LinkTileMobileMenuComponent)
      .exhaustive();
  });
}
