import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectTextTile
} from '../../../../selectors';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  TileSizeDirective,
  MobileEditorCloseDirective
} from '../../../../directives';
import { TILE_ID } from '../../../../context';
import { RichTextEditorComponent, toRichText } from '@oni-shared';
import { TextTile } from '../../../../models';
import { getMaxNumberOfLines } from '../shared';

@UntilDestroy()
@Component({
  standalone: true,
  imports: [RichTextEditorComponent, MobileEditorCloseDirective],
  selector: 'text-tile-mobile-editor',
  templateUrl: './mobile-editor.component.html',
  styleUrl: './mobile-editor.component.scss',
  hostDirectives: [TileSizeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextTileMobileEditorComponent implements OnInit {
  tileId = inject(TILE_ID);

  tile = selectTextTile();
  text = computed(() => toRichText(this.tile().text || ''));

  size = createTileSizeSelector();

  maxLinesCount = computed(() => {
    const size = this.size();
    return getMaxNumberOfLines(size.height);
  });

  ngOnInit() {}

  updateTile = createTileUpdater<TextTile>();
}
