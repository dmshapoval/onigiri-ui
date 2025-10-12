import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TextTile } from '../../../models';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectTextTile
} from '../../../selectors';
import { PageViewStore } from '../../../view.store';
import { getMaxNumberOfLines } from './shared';
import { TILE_ID } from '../../../context';
import { RichTextEditorComponent, toRichText } from '@oni-shared';

@Component({
  selector: 'text-tile',
  standalone: true,
  imports: [ReactiveFormsModule, RichTextEditorComponent],
  templateUrl: 'text-tile.component.html',
  styleUrl: 'text-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextTileComponent implements OnInit {
  tileId = inject(TILE_ID);

  viewStore = inject(PageViewStore);

  tile = selectTextTile();
  text = computed(() => toRichText(this.tile().text || ''));

  size = createTileSizeSelector();

  maxLinesCount = computed(() => {
    const size = this.size();
    return getMaxNumberOfLines(size.height);
  });

  #focusedOut = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  onFocusOut() {
    this.#focusedOut.next();
  }

  updateTile = createTileUpdater<TextTile>();
}
