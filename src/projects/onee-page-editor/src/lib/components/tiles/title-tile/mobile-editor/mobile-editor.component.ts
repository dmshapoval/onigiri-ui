import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageViewStore } from '../../../../view.store';
import { createTileUpdater, selectTitleTile } from '../../../../selectors';
import { TitleTile } from '../../../../models';
import { TilesStore } from '../../../../tiles.store';
import { TILE_ID } from '../../../../context';
import { RichTextEditorComponent, toRichText } from '@oni-shared';
import { MobileEditorCloseDirective } from '../../../../directives';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RichTextEditorComponent,
    MobileEditorCloseDirective
  ],
  selector: 'title-tile-mobile-editor',
  templateUrl: './mobile-editor.component.html',
  styleUrl: './mobile-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleTileMobileEditorComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);
  viewStore = inject(PageViewStore);

  tile = selectTitleTile();
  text = computed(() => toRichText(this.tile().text || ''));

  ngOnInit() {}

  onChanges = createTileUpdater<TitleTile>();
}
