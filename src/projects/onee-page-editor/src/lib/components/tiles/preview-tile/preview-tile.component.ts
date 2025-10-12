import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { TilesStore } from '../../../tiles.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { of, pipe, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { SkeletonModule } from 'primeng/skeleton';
import { selectPreviewTile } from '../../../selectors';
import { TILE_ID } from '../../../context';
import {
  CreateTileData,
  ImageTilePreview,
  LinkTilePreview,
  PreviewTile
} from '../../../models';
import { PagesApiService } from '../../../api/pages-api.service';
import { match } from 'ts-pattern';

@Component({
  selector: 'preview-tile',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: 'preview-tile.component.html',
  styleUrl: 'preview-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewTileComponent implements OnInit {
  tileId = inject(TILE_ID);

  tile = selectPreviewTile();

  isLoading = signal(true);
  error = signal<string | null>(null);

  #tilesStore = inject(TilesStore);
  #api = inject(PagesApiService);

  ngOnInit() {
    const tile = this.tile();

    match(tile)
      .with({ prefiewFor: 'image' }, x => this.#handleImageTilePreview(x))
      .with({ prefiewFor: 'link' }, x => this.#handleLinkTilePreview(x));
  }

  #setErrorState(error: string) {
    this.error.set(error);
    return;
  }

  #handleImageTilePreview = rxMethod<ImageTilePreview>(
    pipe(
      switchMap(tile => {
        const imgFile = tile.imageFile;

        if (imgFile.size >= 10_000_000) {
          this.#setErrorState('Please upload image less than 10MB');
          return of();
        }

        return this.#api.uploadImage(imgFile).pipe(
          tapResponse(
            imgId => {
              const { id, viewConfig } = this.tile();
              this.#saveTile({
                type: 'image',
                id,
                imgId,
                caption: null,
                link: null,
                viewConfig
              });
            },
            e => {
              this.#setErrorState('Failed to upload image');
              this.isLoading.set(false);
            }
          )
        );
      })
    )
  );

  #handleLinkTilePreview(tile: LinkTilePreview) {
    const { id, viewConfig } = this.tile();

    this.#saveTile({
      _type: 'link',
      id,
      url: tile.url,
      viewConfig
    });
  }

  #saveTile = rxMethod<CreateTileData>(
    pipe(
      switchMap(tile =>
        this.#api.addPageTile(tile).pipe(
          tapResponse(
            tile => {
              this.#tilesStore.replacePreviewTile(tile);
              this.isLoading.set(false);
            },
            () => {
              this.#setErrorState('Failed to create tile');
              this.isLoading.set(false);
            }
          )
        )
      )
    )
  );
}

function isImagePreviewTile(tile: PreviewTile): tile is ImageTilePreview {
  return (<ImageTilePreview>tile).prefiewFor === 'image';
}
