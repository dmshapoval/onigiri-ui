import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { PageViewStore } from '../../view.store';
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { PageDataStore } from '../../page-data.store';
import { AddTileMenuComponent } from './add-tile/add-tile-menu.component';
import { ProfileStore } from '../../profile.store';
import { AppearanceMenuComponent } from './appearance/appearance-menu.component';
import { EditTileMenuComponent } from './edit-tile/edit-tile-menu.component';
import { TilesStore } from '../../tiles.store';
import { PageEditorMediator } from '../../mediator';
import { PageEditorMenuController } from './page-editor-menu-controller';

type MenuMode = 'add_tile' | 'appearance' | 'tile-view';

@Component({
  standalone: true,
  imports: [
    TooltipModule,
    ReactiveFormsModule,

    PortalModule,
    OverlayModule,
    AddTileMenuComponent,
    AppearanceMenuComponent,
    EditTileMenuComponent
  ],
  providers: [PageEditorMenuController],
  selector: 'page-editor-menu',
  templateUrl: 'page-editor-menu.component.html',
  styleUrl: 'page-editor-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageEditorMenuComponent implements OnInit {
  viewStore = inject(PageViewStore);
  tilesStore = inject(TilesStore);
  pageDataStore = inject(PageDataStore);
  mediator = inject(PageEditorMediator);
  profileStore = inject(ProfileStore);

  menuEditor = inject(PageEditorMenuController);

  #calculatedMode = computed(() => {
    const onMobile = this.viewStore.onMobileDevice();
    const selectedTile = this.tilesStore.selectedTileId();
    const result: MenuMode | null =
      onMobile && selectedTile ? 'tile-view' : null;

    return result;
  });

  selectedMode = signal<MenuMode>('add_tile');

  mode = computed(() => {
    const selected = this.selectedMode();
    const calculated = this.#calculatedMode();

    if (calculated) {
      return calculated;
    }

    return calculated || selected;
  });

  constructor() {}

  ngOnInit() {}

  onEditPageSettings() {
    this.mediator.send({
      _type: 'edit-settings'
    });
  }
}
