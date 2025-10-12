import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild
} from '@angular/core';
import { PageViewStore } from '../../view.store';

import { AppearanceMobileEditorComponent } from './appearance/appearance-editor.component';
import { PageSettingsMobileEditorComponent } from './page-settings/page-settings-mobile-editor.component';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { match } from 'ts-pattern';
import { NgComponentOutlet } from '@angular/common';
import { TileMobileEditorComponent } from './tile-mobile-editor/tile-mobile-editor.component';
import { SharePageMobilePanelComponent } from './share-page/share-page-mobile-panel.component';
import { PageEditorMediator } from '../../mediator';
import { HasType } from '@oni-shared';
import { TileType } from '../../models';
import { constVoid } from 'fp-ts/es6/function';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface InnerEditorConfig {
  cmp: any;
  props: any;
}

type EditorProps =
  | HasType<'none'>
  | HasType<'background'>
  | HasType<'page-settings'>
  | HasType<'share-page'>
  | (HasType<'tile'> & { tileId: string; tileType: TileType });

const NONE: EditorProps = { _type: 'none' };
const BACKGROUND: EditorProps = { _type: 'background' };
const PAGE_SETTINGS: EditorProps = { _type: 'page-settings' };
const SHARE_PAGE: EditorProps = { _type: 'share-page' };

@Component({
  standalone: true,
  imports: [SidebarModule, NgComponentOutlet],
  selector: 'page-editor-mobile-panel',
  templateUrl: 'mobile-panel.component.html',
  styleUrl: 'mobile-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageEditorMobilePanelComponent implements OnInit {
  #viewStore = inject(PageViewStore);
  #mediator = inject(PageEditorMediator);

  editorPanel = viewChild<Sidebar>('editorPanel');

  #editorType = signal<EditorProps>(NONE);

  editorType: Signal<EditorProps> = computed(() => {
    const selected = this.#editorType();
    const onMobile = this.#viewStore.onMobileDevice();

    return onMobile ? selected : NONE;
  });

  constructor() {
    this.#setupMediatorMessageHandlers();
  }

  innerEditor = computed(() => {
    const onMobile = this.#viewStore.onMobileDevice();
    const editor = this.editorType();

    if (!onMobile || editor._type === 'none') {
      return null;
    }

    return match(editor)
      .returnType<InnerEditorConfig | null>()
      .with({ _type: 'background' }, () => ({
        cmp: AppearanceMobileEditorComponent,
        props: {}
      }))
      .with({ _type: 'page-settings' }, () => ({
        cmp: PageSettingsMobileEditorComponent,
        props: {}
      }))
      .with({ _type: 'share-page' }, () => ({
        cmp: SharePageMobilePanelComponent,
        props: {}
      }))
      .with({ _type: 'tile' }, ({ tileId, tileType }) => ({
        cmp: TileMobileEditorComponent,
        props: { tileId, tileType }
      }))
      .exhaustive();
  });

  ngOnInit() {}

  onPanelClosed() {
    this.#editorType.set(NONE);
  }

  #setupMediatorMessageHandlers() {
    this.#mediator.messages.pipe(takeUntilDestroyed()).subscribe(msg => {
      match(msg)
        .with({ _type: 'close-mobile-editor' }, () =>
          this.#editorType.set(NONE)
        )
        .with({ _type: 'edit-bg' }, () => this.#editorType.set(BACKGROUND))
        .with({ _type: 'edit-settings' }, () =>
          this.#editorType.set(PAGE_SETTINGS)
        )
        .with({ _type: 'share-page' }, () => this.#editorType.set(SHARE_PAGE))
        .with({ _type: 'edit_tile' }, ({ tileId, tileType }) =>
          this.#editorType.set({
            _type: 'tile',
            tileType,
            tileId
          })
        )
        .otherwise(constVoid);
    });
  }
}
