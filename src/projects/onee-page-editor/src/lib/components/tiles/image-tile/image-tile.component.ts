import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { OnigiriImageUrlPipe, toRichText } from '@oni-shared';
import { PageViewStore } from '../../../view.store';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectImageTile
} from '../../../selectors';
import { ImageTile } from '../../../models';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TILE_ID } from '../../../context';
import { RichTextEditorComponent } from '@oni-shared';

@Component({
  selector: 'image-tile',
  standalone: true,
  imports: [
    OnigiriImageUrlPipe,
    FormsModule,
    ReactiveFormsModule,
    RichTextEditorComponent
  ],
  templateUrl: 'image-tile.component.html',
  styleUrl: 'image-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageTileComponent implements OnInit {
  tileId = inject(TILE_ID);

  viewStore = inject(PageViewStore);

  tile = selectImageTile();
  imageId = computed(() => this.tile().imgId);
  tileSize = createTileSizeSelector();

  caption = computed(() => toRichText(this.tile().caption || ''));
  captionIsEmpty = computed(() => !this.tile().caption?.length);

  ngOnInit() {}

  updateTile = createTileUpdater<ImageTile>();
}
