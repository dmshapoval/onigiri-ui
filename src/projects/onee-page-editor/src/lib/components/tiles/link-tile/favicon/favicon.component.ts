import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from '@angular/core';
import {
  OnigiriIconComponent,
  OnigiriImageUrlPipe,
  SafeResourceUrlPipe
} from '@oni-shared';
import { selectLinkTile } from '../../../../selectors';
import { TILE_ID } from '../../../../context';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'link-tile-favicon',
  standalone: true,
  templateUrl: 'favicon.component.html',
  styleUrl: 'favicon.component.scss',
  imports: [
    OnigiriImageUrlPipe,
    OnigiriIconComponent,
    SafeResourceUrlPipe,
    SkeletonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileFaviconComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tile = selectLinkTile();

  data = computed(() => {
    return this.#tile().favicon;
  });

  ngOnInit() {}
}
