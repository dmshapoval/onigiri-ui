import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { OnigiriIconComponent, OnigiriTemplate } from '@oni-shared';
import {
  OnboardingFormComponent,
  PageLoadingPlaceholderComponent,
  ViewTypeSelectorComponent
} from '../components';
import { TilesStore } from '../tiles.store';
import { PageDataStore } from '../page-data.store';
import { ProfileStore } from '../profile.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { PageViewStore } from '../view.store';
import { PagesApiService } from '../api/pages-api.service';
import { ApiRequestsService } from '../api-requests.service';
import { PageEditorMenuComponent } from './menu/page-editor-menu.component';
import { WithLayoutClsDirective } from '../directives/with-layout-cls.directive';
import { PageEditorMediator } from '../mediator';
import { TilesEditorComponent } from './tiles-editor/tiles-editor.component';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';
import { PageEditorMobilePanelComponent } from './mobile-panel/mobile-panel.component';
import { PageEditorDialogsController } from './dialogs/dialogs-controller';
import { match } from 'ts-pattern';
import { v4 as uuidv4 } from 'uuid';

const PROFILE_TO_TILES_MARGIN = 50;

@Component({
  standalone: true,
  imports: [
    NgTemplateOutlet,
    TilesEditorComponent,
    ViewTypeSelectorComponent,
    ProfileEditorComponent,
    PageEditorMobilePanelComponent,
    PageEditorMenuComponent,
    OnigiriIconComponent,
    WithLayoutClsDirective,
    OnboardingFormComponent,
    PageLoadingPlaceholderComponent
  ],
  selector: 'onee-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: [
    './page-editor.component.scss',
    './styles/nav.scss',
    './styles/editor-v2.scss',
    './styles/utils.scss',
    './styles/link-tile.scss',
    './styles/tile-placeholder.scss',
    './styles/tile-menu.scss'
  ],
  providers: [
    ApiRequestsService,
    PageDataStore,
    TilesStore,
    PageViewStore,
    ProfileStore,
    PageEditorMediator,
    PageEditorDialogsController
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OneePageEditorComponent implements AfterViewInit {
  templates = contentChildren(OnigiriTemplate);

  closeBtnTpl = computed(() => {
    return (
      this.templates().find(x => x.name === 'closeButton')?.template || null
    );
  });

  dataStore = inject(PageDataStore);
  tilesStore = inject(TilesStore);
  pageViewStore = inject(PageViewStore);
  #profileStore = inject(ProfileStore);

  #cdr = inject(ChangeDetectorRef);
  #mediator = inject(PageEditorMediator);

  @HostBinding('style.--page-bg-color') pageBgColor = '#F5F5F5';
  @HostBinding('style.--editor-bg-color') editorBgColor = '#F5F5F5';

  profileEditorEl = viewChild<ElementRef<HTMLDivElement>>('profileEditor');
  tilesEditorEl = viewChild<ElementRef<HTMLDivElement>>('tilesEditor');

  tilesTopOffset = signal('unset');
  editorHeight = signal('800px');

  viewType = computed(() => this.pageViewStore.viewType());
  layout = computed(() => this.dataStore.layout());

  isLoading = signal(true);

  #api = inject(PagesApiService);

  constructor() {
    this.#loadPage();
    this.#setupBackground();

    // we need to initialize it
    const _ = inject(PageEditorDialogsController);

    this.#setupLayoutRecalculate();
  }

  ngAfterViewInit(): void {
    this.#recalculateTileTopOffset();
    this.#recalculateEditorTotalHeight();

    setTimeout(() => {
      this.#recalculateTileTopOffset();
      this.#recalculateEditorTotalHeight();
    }, 500);
  }

  onSharePage() {
    this.#mediator.send({
      _type: 'share-page'
    });
  }

  #loadPage = rxMethod<void>(
    pipe(
      switchMap(() =>
        this.#api.getPage().pipe(
          tapResponse(
            page => {
              this.dataStore.setState(page);
              this.tilesStore.setState(page);
              this.#profileStore.setState(page);
              this.handleOnboardingResults();
              setTimeout(() => {
                this.isLoading.set(false);
              }, 800);
            },
            e => {
              console.error(e);
              this.isLoading.set(false);
            }
          )
        )
      )
    )
  );

  handleOnboardingResults() {
    const fromStorage = localStorage.getItem('ONEE_PAGE_ONBOARDING_RESULTS');

    if (!fromStorage) {
      return;
    }

    const urls: string[] = JSON.parse(fromStorage);

    urls.forEach(url => {
      const id = uuidv4();

      const viewType = this.viewType();

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
    });

    localStorage.removeItem('ONEE_PAGE_ONBOARDING_RESULTS');
  }

  #setupBackground() {
    effect(() => {
      const bgColor = this.dataStore.selectedBGColor();
      const onMobile = this.pageViewStore.onMobileDevice();
      const viewType = this.pageViewStore.viewType();

      this.editorBgColor = bgColor;

      this.pageBgColor =
        onMobile || viewType !== 'mobile' ? bgColor : '#EDEDED';

      this.#cdr.markForCheck();
    });
  }

  #setupLayoutRecalculate() {
    effect(
      () => {
        const _ = this.layout();
        const __ = this.pageViewStore.onMobileDevice();
        this.#recalculateTileTopOffset();
        this.#recalculateEditorTotalHeight();

        setTimeout(() => {
          this.#recalculateTileTopOffset();
          this.#recalculateEditorTotalHeight();
        }, 150);

        setTimeout(() => {
          this.#recalculateTileTopOffset();
          this.#recalculateEditorTotalHeight();
        }, 300);
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const _ = this.#profileStore.name();
        const __ = this.#profileStore.description();

        this.#recalculateTileTopOffset();
        this.#recalculateEditorTotalHeight();
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const _ = this.tilesStore.positioned();

        setTimeout(() => {
          this.#recalculateEditorTotalHeight();
        }, 500);
      },
      { allowSignalWrites: true }
    );
  }

  #recalculateTileTopOffset = rxMethod<void>(
    tap(() => {
      const layout = this.layout();
      const viewType = this.viewType();
      const profileEditorHeight =
        this.profileEditorEl()?.nativeElement.clientHeight || 100;

      const offset = match({ viewType, layout })
        .with({ viewType: 'mobile' }, () => 'unset')
        .with(
          { layout: 'profile_top' },
          () => `${profileEditorHeight + PROFILE_TO_TILES_MARGIN}px`
        )
        .otherwise(() => '0px');

      this.tilesTopOffset.set(offset);
    })
  );

  #recalculateEditorTotalHeight = rxMethod<void>(
    tap(() => {
      if (this.pageViewStore.onMobileDevice()) {
        this.editorHeight.set('unset');
      }

      const layout = this.layout();
      const viewType = this.viewType();
      const profileHeight =
        this.profileEditorEl()?.nativeElement.clientHeight || 100;

      const tilesHeight =
        this.tilesEditorEl()?.nativeElement.clientHeight || 800;

      const result = match({ viewType, layout })
        .with(
          { viewType: 'mobile' },
          { layout: 'profile_top' },
          () => profileHeight + tilesHeight + PROFILE_TO_TILES_MARGIN
        )
        .otherwise(() => Math.max(profileHeight, tilesHeight));

      this.editorHeight.set(`${result + 40}px`);
    })
  );
}
