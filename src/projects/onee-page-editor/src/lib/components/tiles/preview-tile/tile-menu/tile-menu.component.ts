import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit
} from '@angular/core';
import { TILE_ID } from '../../../../context';

@Component({
  standalone: true,
  imports: [],
  selector: 'image-tile-menu',
  templateUrl: 'tile-menu.component.html',
  styleUrl: 'tile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewTileMenuComponent implements OnInit {
  tileId = inject(TILE_ID);

  ngOnInit() {}
}
