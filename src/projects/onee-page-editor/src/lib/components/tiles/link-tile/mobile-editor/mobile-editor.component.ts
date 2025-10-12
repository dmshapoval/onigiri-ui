import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  viewChild
} from '@angular/core';
import { LinkTileFaviconComponent } from '../favicon/favicon.component';
import { IconKey, OnigiriIconComponent, toRichText } from '@oni-shared';
import {
  createTileSizeSelector,
  createTileUpdater,
  selectLinkTile
} from '../../../../selectors';
import { LinkTile } from '../../../../models';
import { TilesStore } from '../../../../tiles.store';
import { getTitleFromUrl } from '../shared';
import { ThumbImageViewModel } from '../thumb-image/thumb-image.viewmodel';
import { LinkTileThumbImageComponent } from '../thumb-image/thumb-image.component';
import { TILE_ID } from '../../../../context';
import { RichTextEditorComponent } from '@oni-shared';
import { MobileEditorCloseDirective } from '../../../../directives';
import { match } from 'ts-pattern';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ThumbAction {
  iconKey: IconKey;
  handler: () => void;
}

@Component({
  standalone: true,
  imports: [
    LinkTileFaviconComponent,

    OnigiriIconComponent,
    LinkTileThumbImageComponent,
    RichTextEditorComponent,
    MobileEditorCloseDirective
  ],
  selector: 'link-tile-mobile-editor',
  templateUrl: './mobile-editor.component.html',
  styleUrl: './mobile-editor.component.scss',
  providers: [ThumbImageViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTileMobileEditorComponent implements OnInit {
  tileId = inject(TILE_ID);

  // #tilesStore = inject(TilesStore);
  thumbImage = inject(ThumbImageViewModel);

  thumbImageSelector =
    viewChild<ElementRef<HTMLInputElement>>('thumbImageSelector');

  tile = selectLinkTile();
  size = createTileSizeSelector();
  title = computed(() => toRichText(this.tile().title || ''));

  resolvedTitle = computed(() => {
    return match(this.tile().linkData)
      .with({ _type: 'resolved' }, x => x.title)
      .otherwise(() => null);
  });

  resolvedThumbUrl = computed(() => {
    return match(this.tile().linkData)
      .with({ _type: 'resolved' }, x => x.thumbImgUrl)
      .otherwise(() => null);
  });

  titlePlaceholder = computed(() => {
    const tile = this.tile();
    return this.resolvedTitle() || getTitleFromUrl(tile.url);
  });

  constructor() {
    this.thumbImage.onSelectCustomImage
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.thumbImageSelector()?.nativeElement.click());
  }

  // thumbActions = computed(() => {
  //   const data = this.thumbImage.thumbData();
  //   const resolvedThumbUrl = this.resolvedThumbUrl();

  //   const uploadCustom: ThumbAction = {
  //     iconKey: 'image',
  //     handler: () => this.thumbImageSelector()?.nativeElement.click()
  //   };

  //   const clear: ThumbAction = {
  //     iconKey: 'trash',
  //     handler: () => this.thumbImage.remove()
  //   };

  //   const reSync: ThumbAction = {
  //     iconKey: 'sync_img',
  //     handler: () => this.thumbImage.refetch()
  //   };

  //   return match(data)
  //     .returnType<ThumbAction[]>()
  //     .with({ _type: 'pending' }, () => [])
  //     .with({ _type: 'none' }, () =>
  //       resolvedThumbUrl ? [uploadCustom, reSync] : [uploadCustom]
  //     )
  //     .with({ _type: 'custom' }, () =>
  //       resolvedThumbUrl ? [uploadCustom, reSync, clear] : [uploadCustom, clear]
  //     )
  //     .with({ _type: 'resolved' }, () => [uploadCustom, clear])
  //     .exhaustive();
  // });

  ngOnInit() {}

  updateTile = createTileUpdater<LinkTile>();
}
