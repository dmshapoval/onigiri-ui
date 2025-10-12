import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import { PageViewStore } from '../../../view.store';
import { TilesStore } from '../../../tiles.store';
import { TitleTileComponent } from '../title-tile/title-tile.component';
import { TextTileComponent } from '../text-tile/text-tile.component';
import { ImageTileComponent } from '../image-tile/image-tile.component';
import { PreviewTileComponent } from '../preview-tile/preview-tile.component';
import { LinkTileComponent } from '../link-tile/link-tile.component';
import { OnigiriIconComponent } from '@oni-shared';
import { match } from 'ts-pattern';
import { NgComponentOutlet } from '@angular/common';
import { TileSizeDirective } from '../../../directives';
import { TILE_ID } from '../../../context';
import { TextTileMenuComponent } from '../text-tile/tile-menu/tile-menu.component';
import { ImageTileMenuComponent } from '../image-tile/tile-menu/tile-menu.component';
import { PreviewTileMenuComponent } from '../preview-tile/tile-menu/tile-menu.component';
import { LinkTileMenuComponent } from '../link-tile/tile-menu/tile-menu.component';
import {
  desktopMenuAnimation,
  dragHandlerAnimation,
  mobileActionsAnimation
} from './animations';
import { PageEditorMediator } from '../../../mediator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'tile-container',
  standalone: true,
  imports: [OnigiriIconComponent, TileSizeDirective, NgComponentOutlet],
  templateUrl: 'tile-container.component.html',
  styleUrl: 'tile-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    desktopMenuAnimation,
    mobileActionsAnimation,
    dragHandlerAnimation
  ],
  providers: [
    {
      provide: TILE_ID,
      useFactory: (cmp: TileContainerComponent) => cmp.tileId,
      deps: [TileContainerComponent]
    }
  ]
})
export class TileContainerComponent implements OnInit {
  tileId = input.required<string>();

  tilesStore = inject(TilesStore);
  #el = inject(ElementRef);
  #mediator = inject(PageEditorMediator);
  viewStore = inject(PageViewStore);

  isHovered = signal(false);

  tile = computed(() => {
    const id = this.tileId();
    return this.tilesStore.tiles().find(x => x.id === id) || null;
  });

  tileType = computed(() => this.tile()?.type || null);

  tileSize = computed(() => {
    const { desktop, mobile } = this.tilesStore.positioned();
    const vt = this.viewStore.viewType();
    const id = this.tileId();

    const tiles = vt === 'desktop' ? desktop : mobile;

    const tile = tiles.find(x => x.tileId === id);
    return tile && tile.size ? tile.size : { width: 0, height: 0 };
  });

  isSelected = computed(() => {
    return this.tileId() === this.tilesStore.selectedTileId();
  });

  tileCmp = computed(() => {
    const tileType = this.tileType();

    if (!tileType) {
      return null;
    }

    return match(tileType)
      .with('text', () => TextTileComponent)
      .with('image', () => ImageTileComponent)
      .with('preview', () => PreviewTileComponent)
      .with('title', () => TitleTileComponent)
      .with('link', () => LinkTileComponent)
      .exhaustive();
  });

  tileMenuCmp = computed(() => {
    const tileType = this.tileType();

    if (!tileType) {
      return null;
    }

    return match(tileType)
      .with('text', () => TextTileMenuComponent)
      .with('image', () => ImageTileMenuComponent)
      .with('preview', () => PreviewTileMenuComponent)
      .with('title', () => null)
      .with('link', () => LinkTileMenuComponent)
      .exhaustive();
  });

  constructor() {
    this.#setupScrollToViewHandler();
  }

  ngOnInit() {}

  onClick() {
    if (this.viewStore.onMobileDevice()) {
      this.#mediator.send({
        _type: 'select_tile',
        tileId: this.tileId()
      });
    }
  }

  onMouseOver() {
    if (this.viewStore.onMobileDevice()) {
      return;
    }

    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }

  onDeleteTile() {
    this.tilesStore.deleteTile(this.tileId());
  }

  showMobileEditor() {
    const tileType = this.tileType();

    if (tileType) {
      this.#mediator.send({
        _type: 'edit_tile',
        tileId: this.tileId(),
        tileType
      });
    }
  }

  #setupScrollToViewHandler() {
    this.#mediator.messages.pipe(takeUntilDestroyed()).subscribe(m => {
      if (m._type === 'scroll_to_tile' && m.tileId === this.tileId()) {
        this.#el.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  }
}
