import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { TILE_ID } from '../../../../context';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectImageTile
} from '../../../../selectors';
import { TilesStore } from '../../../../tiles.store';
import { PageViewStore } from '../../../../view.store';
import { OnigiriIconComponent } from '@oni-shared';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ImageTile } from '../../../../models';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent, ReactiveFormsModule, InputTextModule],
  selector: 'image-tile-menu',
  templateUrl: 'tile-menu.component.html',
  styleUrl: 'tile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageTileMenuComponent implements OnInit {
  tileId = inject(TILE_ID);
  #destroyRef = inject(DestroyRef);

  #tilesStore = inject(TilesStore);
  #viewStore = inject(PageViewStore);

  tile = selectImageTile();
  tileSize = createTileSizeSelector();

  showLinkInput = signal(false);
  linkInput = new FormControl<string | null>(null);

  ngOnInit() {
    this.linkInput.setValue(this.tile().link, { emitEvent: false });

    this.linkInput.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.#destroyRef))
      .subscribe(link => {
        this.updateTile({ link });
      });
  }

  updateTile = createTileUpdater<ImageTile>();

  updateTileSize(width: number, height: number) {
    const viewType = this.#viewStore.viewType();
    const tileId = this.tileId();

    this.#tilesStore.updateTileSize({ tileId, height, width }, viewType);
  }

  onDeleteTile() {
    this.#tilesStore.deleteTile(this.tileId());
  }
}
