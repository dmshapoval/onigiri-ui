import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { TilesStore } from '../../../tiles.store';
import { PageViewStore } from '../../../view.store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OnigiriIconComponent, toRichText } from '@oni-shared';
import { createTileUpdater, selectTitleTile } from '../../../selectors';
import { TitleTile } from '../../../models';
import { RichTextEditorComponent } from '@oni-shared';
import { TILE_ID } from '../../../context';

@Component({
  selector: 'title-tile',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RichTextEditorComponent,
    OnigiriIconComponent
  ],
  templateUrl: 'title-tile.component.html',
  styleUrl: 'title-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleTileComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);
  viewStore = inject(PageViewStore);

  tile = selectTitleTile();
  text = computed(() => toRichText(this.tile().text || ''));

  ngOnInit() {}

  updateTile = createTileUpdater<TitleTile>();

  removeTile() {
    this.#tilesStore.deleteTile(this.tileId());
  }
}
