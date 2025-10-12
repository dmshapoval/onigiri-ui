import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { PageViewStore } from '../../../view.store';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ComingSoonChipComponent,
  ensureUrlProtocol,
  OnigiriIconComponent,
  URL_REGEX
} from '@oni-shared';
import { TooltipModule } from 'primeng/tooltip';
import { TilesStore } from '../../../tiles.store';
import { v4 as uuidv4 } from 'uuid';
import { HideOnMobileDirective } from '../../../directives/hide-on-mobile.directive';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, throttleTime } from 'rxjs';
import { TileType } from '../../../models/tiles';
import { PageEditorMediator } from '../../../mediator';
import { PageEditorMenuController } from '../page-editor-menu-controller';

type ViewMode = 'default' | 'link_input';

@Component({
  standalone: true,
  imports: [
    TooltipModule,
    ReactiveFormsModule,
    ComingSoonChipComponent,
    OnigiriIconComponent,
    HideOnMobileDirective
  ],
  selector: 'add-tile-menu',
  templateUrl: 'add-tile-menu.component.html',
  styleUrl: 'add-tile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTileMenuComponent implements OnInit {
  #mediator = inject(PageEditorMediator);
  viewStore = inject(PageViewStore);
  tilesStore = inject(TilesStore);

  menuEditor = inject(PageEditorMenuController);

  mode = signal<ViewMode>('default');

  imageSelector = viewChild<ElementRef<HTMLInputElement>>('imageSelector');

  linkInput = new FormControl<string | null>(null, [
    Validators.required,
    Validators.pattern(URL_REGEX)
  ]);

  ngOnInit() {}

  addTitleTile = rxMethod<void>(
    pipe(
      throttleTime(700),
      tap(() => {
        const viewType = this.viewStore.viewType();
        const id = uuidv4();

        this.tilesStore.addTile({
          viewType,
          tile: { id, type: 'title', text: '' },
          size: { width: viewType === 'desktop' ? 4 : 2, height: 1 }
        });

        this.#onTileAdded(id, 'title');
      })
    )
  );

  addTextTile() {
    const viewType = this.viewStore.viewType();
    const id = uuidv4();

    this.tilesStore.addTile({
      tile: { id, type: 'text', text: '' },
      size: { width: 1, height: 2 },
      viewType
    });

    this.#onTileAdded(id, 'text');
  }

  addLinkTile() {
    if (this.linkInput.invalid) {
      return;
    }

    let url = ensureUrlProtocol(this.linkInput.value!.trim());

    const id = uuidv4();

    const viewType = this.viewStore.viewType();

    this.tilesStore.addTile({
      size: { width: 1, height: 2 },
      viewType,
      tile: {
        id,
        type: 'preview',
        prefiewFor: 'link',
        url
      }
    });

    this.linkInput.setValue(null);
    this.mode.set('default');
    this.#onTileAdded(id, 'preview');
  }

  onImageSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const imageFile = files[0];

    const id = uuidv4();

    const viewType = this.viewStore.viewType();

    this.tilesStore.addTile({
      size: { width: 1, height: 2 },
      viewType,
      tile: {
        id,
        type: 'preview',
        prefiewFor: 'image',
        imageFile
      }
    });

    const imgFileInput = this.imageSelector();
    if (imgFileInput) {
      imgFileInput.nativeElement.value = '';
    }

    this.#onTileAdded(id, 'preview');
  }

  onEditPageSettings() {
    this.#mediator.send({
      _type: 'edit-settings'
    });
  }

  #onTileAdded(tileId: string, tileType: TileType) {
    setTimeout(() => {
      this.#mediator.schedule(300, {
        _type: 'scroll_to_tile',
        tileId
      });
    });

    if (this.viewStore.onMobileDevice()) {
      this.#mediator.schedule(400, {
        _type: 'select_tile',
        tileId
      });

      // this.#mediator.schedule(800, {
      //   _type: 'edit_tile',
      //   tileId,
      //   tileType
      // });
    }
  }
}
