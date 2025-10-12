import {
  computed,
  EventEmitter,
  inject,
  Injectable,
  signal
} from '@angular/core';
import { createTileUpdater, selectLinkTile } from '../../../../selectors';
import { AppToolsService, IconKey } from '@oni-shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { LinkTile } from '../../../../models';
import { PagesApiService } from '../../../../api/pages-api.service';
import { match } from 'ts-pattern';

interface ThumbAction {
  iconKey: IconKey;
  handler: () => void;
}

@Injectable()
export class ThumbImageViewModel {
  #tile = selectLinkTile();
  #tools = inject(AppToolsService);
  #api = inject(PagesApiService);

  onSelectCustomImage = new EventEmitter<void>();

  thumbData = computed(() => {
    const { thumbImage } = this.#tile();
    return thumbImage;
  });

  resolvedThumbUrl = computed(() => {
    return match(this.#tile().linkData)
      .with({ _type: 'resolved' }, x => x.thumbImgUrl)
      .otherwise(() => null);
  });

  imageId = computed(() => {
    const thumbImage = this.thumbData();
    return match(thumbImage)
      .with({ _type: 'custom' }, x => x.imageId)
      .with({ _type: 'resolved' }, x => x.imageId)
      .otherwise(() => null);
  });

  actions = computed(() => {
    const data = this.thumbData();
    const resolvedThumbUrl = this.resolvedThumbUrl();

    const uploadCustom: ThumbAction = {
      iconKey: 'image',
      handler: () => this.onSelectCustomImage.emit()
    };

    const clear: ThumbAction = {
      iconKey: 'trash',
      handler: () => this.remove()
    };

    const reSync: ThumbAction = {
      iconKey: 'sync_img',
      handler: () => this.refetch()
    };

    return match(data)
      .returnType<ThumbAction[]>()
      .with({ _type: 'pending' }, () => [])
      .with({ _type: 'none' }, () =>
        resolvedThumbUrl ? [uploadCustom, reSync] : [uploadCustom]
      )
      .with({ _type: 'custom' }, () =>
        resolvedThumbUrl ? [uploadCustom, reSync, clear] : [uploadCustom, clear]
      )
      .with({ _type: 'resolved' }, () => [uploadCustom, clear])
      .exhaustive();
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  refetch() {
    const link = this.#tile().url;
    if (!link) {
      return;
    }
    this.#executeRefetch(link);
  }

  uploadCustom(files: FileList | null) {
    if (!files || files.length === 0) return;
    const imgFile = files[0];
    if (imgFile.size >= 10_000_000) {
      this.error.set('Please upload image less than 10MB');
      return;
    }

    this.#executeCustomImageUpload(imgFile);
  }

  remove() {
    this.#updateTile({
      thumbImage: { _type: 'none' }
    });
  }

  tryUpdateResolvedImage = rxMethod<string>(
    pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(imgUrl =>
        this.#api.uploadImageByUrl(imgUrl).pipe(
          tapResponse(
            imageId => {
              this.isLoading.set(false);
              this.#updateTile({ thumbImage: { _type: 'resolved', imageId } });
            },
            () => {
              this.isLoading.set(false);
              console.error('Failed to save resolved image by url', imgUrl);
            }
          )
        )
      )
    )
  );

  #updateTile = createTileUpdater<LinkTile>();

  #executeRefetch = rxMethod<string>(
    pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(link =>
        this.#tools.getOpenGraphMetadata(link).pipe(
          tapResponse(
            resp => {
              const imageUrl = resp.data?.image || null;
              if (imageUrl) {
                this.tryUpdateResolvedImage(imageUrl);
              } else {
                this.isLoading.set(false);
              }
            },
            e => {
              this.isLoading.set(false);
              console.error('Failed to get OG metadata', e);
            }
          )
        )
      )
    )
  );

  #executeCustomImageUpload = rxMethod<File>(
    pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(imgFile =>
        this.#api.uploadImage(imgFile).pipe(
          tapResponse(
            imageId => {
              this.isLoading.set(false);
              this.#updateTile({ thumbImage: { _type: 'custom', imageId } });
            },
            () => {
              this.isLoading.set(false);
              this.error.set('Failed to upload image');
            }
          )
        )
      )
    )
  );
}
