import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit
} from '@angular/core';
import {
  ImageTileMobileEditorComponent,
  LinkTileMobileEditorComponent,
  TextTileMobileEditorComponent,
  TitleTileMobileEditorComponent
} from '../../../components';
import { TileType } from '../../../models';
import { match } from 'ts-pattern';
import { TILE_ID } from '../../../context';
import { NgComponentOutlet } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgComponentOutlet],
  selector: 'tile-mobile-editor',
  templateUrl: 'tile-mobile-editor.component.html',
  providers: [
    {
      provide: TILE_ID,
      useFactory: (cmp: TileMobileEditorComponent) => cmp.tileId,
      deps: [TileMobileEditorComponent]
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileMobileEditorComponent implements OnInit {
  tileId = input.required<string>();
  tileType = input.required<TileType>();

  editorCmp = computed(() =>
    match(this.tileType())
      .with('text', () => TextTileMobileEditorComponent)
      .with('image', () => ImageTileMobileEditorComponent)
      .with('title', () => TitleTileMobileEditorComponent)
      .with('link', () => LinkTileMobileEditorComponent)
      .otherwise(() => null)
  );

  ngOnInit() {}
}
