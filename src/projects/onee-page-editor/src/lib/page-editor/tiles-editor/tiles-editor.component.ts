import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  untracked,
  viewChild,
  ViewChild
} from '@angular/core';
import { TilesStore } from '../../tiles.store';
import { PageViewStore } from '../../view.store';
import {
  GridstackComponent,
  GridstackModule,
  NgGridStackOptions,
  nodesCB
} from 'gridstack/dist/angular';
import { TilePosition } from '../../models';
import { GridStackWidget } from 'gridstack';
import { TileContainerComponent } from '../../components';

@Component({
  standalone: true,
  imports: [GridstackModule, TileContainerComponent],
  selector: 'tiles-editor',
  templateUrl: 'tiles-editor.component.html',
  styleUrl: 'tiles-editor.component.scss'
})
export class TilesEditorComponent implements OnInit {
  desktopGrid = viewChild('desktopGrid', { read: GridstackComponent });
  mobileGrid = viewChild('mobileGrid', { read: GridstackComponent });

  tilesStore = inject(TilesStore);
  viewStore = inject(PageViewStore);

  desktopGridItems = signal<GridStackWidget[]>([]);
  mobileGridItems = signal<GridStackWidget[]>([]);

  desktopGridOptions: NgGridStackOptions = {
    float: false,
    margin: 20,
    cellHeight: 107.5,
    column: 4,

    alwaysShowResizeHandle: false
  };

  mobileGridOptions = computed(() => {
    const onMobile = this.viewStore.onMobileDevice();
    const result: NgGridStackOptions = {
      float: false,
      margin: 20,
      cellHeight: 107.5,
      column: 2,

      alwaysShowResizeHandle: false
    };

    if (onMobile) {
      result.handle = '.tile-drag-handler';
    }

    return result;
  });

  constructor() {
    this.#setupGrid();
  }

  ngOnInit() {}

  onDragStarted() {
    // this.pageStore.dragStarted();
  }

  onDragFinished() {
    // this.pageStore.dragFinished();
  }

  onChange(data: nodesCB) {
    // console.log('GRID UPDATED', data);

    const reqs: UpdateTilePositionRequest[] = data.nodes?.map(tile => ({
      tileId: tile.id!,
      position: {
        column: tile.x! + 1,
        row: tile.y! + 1
      }
    }));

    if (reqs?.length) {
      this.tilesStore.updateTilePositions(reqs, this.viewStore.viewType());
    }
  }

  #setupGrid() {
    effect(() => {
      const viewType = this.viewStore.viewType();
      const mobileGrid = this.mobileGrid();
      const desktopGrid = this.desktopGrid();

      if (viewType === 'desktop') {
        mobileGrid?.grid?.disable();
        desktopGrid?.grid?.enable();
      } else {
        mobileGrid?.grid?.enable();
        desktopGrid?.grid?.disable();
      }
    });

    effect(
      () => {
        const viewType = this.viewStore.viewType();
        const { desktop, mobile } = this.tilesStore.positioned();

        const tiles = viewType === 'desktop' ? desktop : mobile;

        const items = tiles.map(t => ({
          autoPosition: false,
          x: t.position.column - 1,
          y: t.position.row - 1,
          h: t.size.height,
          w: t.size.width,
          id: t.tileId,
          noResize: true
        }));

        if (viewType === 'desktop') {
          this.desktopGridItems.set(items);
        } else {
          this.mobileGridItems.set(items);
        }
      },
      { allowSignalWrites: true }
    );
  }
}

interface UpdateTilePositionRequest {
  tileId: string;
  position: TilePosition;
}
