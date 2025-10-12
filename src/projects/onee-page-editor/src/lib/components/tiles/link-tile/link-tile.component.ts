import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { LinkTileFaviconComponent } from './favicon/favicon.component';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectLinkTile
} from '../../../selectors';
import { LinkTile } from '../../../models';
import {
  OnigiriIconComponent,
  RichTextEditorComponent,
  toRichText
} from '@oni-shared';
import { getCleanLinkUrl, getTitleFromUrl } from './shared';
import { TILE_ID } from '../../../context';
import { ThumbImageViewModel } from './thumb-image/thumb-image.viewmodel';
import { LinkTileThumbImageComponent } from './thumb-image/thumb-image.component';
import { TileSizeDirective } from '../../../directives';
import { match } from 'ts-pattern';
import { PageViewStore } from '../../../view.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { interval, of, pipe, switchMap, take, tap } from 'rxjs';
import { TilesStore } from '../../../tiles.store';
import { LinkTileThumbEditMenuComponent } from './thumb-edit-menu/thumb-edit-menu.component';
import { isHovered } from '../utils';
import { thumbMenuAnimation } from './animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'link-tile',
  standalone: true,
  imports: [
    LinkTileThumbImageComponent,
    LinkTileFaviconComponent,
    RichTextEditorComponent,
    OnigiriIconComponent
  ],
  templateUrl: 'link-tile.component.html',
  styleUrl: 'link-tile.component.scss',
  providers: [ThumbImageViewModel],
  hostDirectives: [TileSizeDirective],
  animations: [thumbMenuAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileComponent implements OnInit {
  tileId = inject(TILE_ID);

  #tilesStore = inject(TilesStore);
  viewStore = inject(PageViewStore);
  thumbImage = inject(ThumbImageViewModel);

  thumbHovered = signal(false);

  tile = selectLinkTile();
  size = createTileSizeSelector();

  url = computed(() => this.tile().url);
  title = computed(() => toRichText(this.tile().title || ''));

  linkCleanUrl = computed(() => {
    const original = this.url();
    return original ? getCleanLinkUrl(original) : null;
  });

  thumbImageSelector =
    viewChild<ElementRef<HTMLInputElement>>('thumbImageSelector');

  thumbImageIsLoading = signal(false);
  thumbImageError = signal<string | null>(null);

  resolvedTitle = computed(() => {
    return match(this.tile().linkData)
      .with({ _type: 'resolved' }, x => x.title)
      .otherwise(() => null);
  });

  titlePlaceholder = computed(() => {
    const tile = this.tile();
    return this.resolvedTitle() || getTitleFromUrl(tile.url);
  });

  constructor() {
    this.#setupRefresh();

    this.thumbImage.onSelectCustomImage
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.thumbImageSelector()?.nativeElement.click();
      });
  }

  ngOnInit() {}

  updateTile = createTileUpdater<LinkTile>();

  titleMaxLines = computed(() => {
    const size = this.size();
    return match(size)
      .with({ height: 1 }, () => 1)
      .with({ height: 2 }, () => 3)
      .with({ height: 4, width: 2 }, () => 3)
      .otherwise(() => 6);
  });

  #setupRefresh() {
    const createRefresher = (timeout: number, refresher: () => void) =>
      rxMethod<boolean>(
        pipe(
          switchMap(needRefresh => {
            if (!needRefresh) {
              return of();
            }

            return interval(timeout).pipe(take(20), tap(refresher));
          })
        )
      );

    const needRefreshLinkData = computed(
      () => this.tile().linkData._type === 'pending'
    );

    const needRefreshFavicon = computed(() => {
      const tile = this.tile();
      return (
        tile.linkData._type !== 'pending' && tile.favicon._type === 'pending'
      );
    });

    const needRefreshThumb = computed(() => {
      const tile = this.tile();
      return (
        tile.linkData._type !== 'pending' && tile.thumbImage._type === 'pending'
      );
    });

    createRefresher(1000, () =>
      this.#tilesStore.refreshLinkTileResolvedData(this.tileId())
    )(needRefreshLinkData);

    createRefresher(800, () =>
      this.#tilesStore.refreshLinkTileFavicon(this.tileId())
    )(needRefreshFavicon);

    createRefresher(800, () =>
      this.#tilesStore.refreshLinkTileThumbnail(this.tileId())
    )(needRefreshThumb);
  }
}

// #resolveLinkData = rxMethod<string>(
//   pipe(
//     exhaustMap(link => {
//       return this.#tools.getOpenGraphMetadata(link).pipe(
//         tapResponse(resp => {
//           if (!resp.success) {
//             return;
//           }
//           const metadata = resp.data!;

//           const resolvedData: LinkTile['resolvedData'] = {
//             title: metadata.title || null,
//             faviconUrl: metadata.logo || null,
//             thumbImgUrl: metadata.image || null
//           };

//           this.updateTile({ resolvedData });

//           const { thumbImgUrl, faviconUrl } = resolvedData;

//           this.#updateImageIfNeeded(thumbImgUrl);
//           this.#updateFaviconIfNeeded(faviconUrl);
//         }, constVoid)
//       );
//     })
//   )
// );

// #updateFavicon(favicon: LinkTileFavicon) {
//   this.updateTile({ favicon });
// }

// #updateImageIfNeeded(imgUrl: string | null) {
//   if (imgUrl && this.tile().thumbImage.type === 'resolved') {
//     this.thumbImage.tryUpdateResolvedImage(imgUrl);
//   }
// }

// #tryResolveData() {
//   const tile = this.tile();

//   if (!tile.url) {
//     return;
//   }

//   const needResolve =
//     !tile.resolvedData.title &&
//     !tile.resolvedData.thumbImgUrl &&
//     !tile.resolvedData.faviconUrl;

//   if (needResolve) {
//     this.#resolveLinkData(tile.url);
//   }
// }

// #updateFaviconIfNeeded = rxMethod<string | null>(
//   pipe(
//     switchMap(faviconUrl => {
//       const tile = this.tile();

//       if (tile.isKnown) {
//         return of();
//       }

//       const { favicon } = tile;

//       if (!faviconUrl) {
//         if (favicon.type === 'resolved') {
//           this.#updateFavicon({ type: 'no_icon' });
//         }

//         return of();
//       }

//       if (favicon.type === 'url' && faviconUrl === favicon.url) {
//         return of();
//       }

//       if (favicon.type === 'resolved' || favicon.type === 'no_icon') {
//         return this.#imgService.saveImageByUrl(faviconUrl).pipe(
//           tapResponse(
//             imageId => this.#updateFavicon({ type: 'resolved', imageId }),
//             () => this.#updateFavicon({ type: 'url', url: faviconUrl })
//           )
//         );
//       }

//       return of();
//     })
//   )
// );
