import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  viewChild
} from '@angular/core';
import { PageViewStore } from '../../../view.store';
import { PageDataStore } from '../../../page-data.store';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { ComingSoonChipComponent, OnigiriIconComponent } from '@oni-shared';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import { TooltipModule } from 'primeng/tooltip';
import { PageEditorMediator } from '../../../mediator';
import { PageEditorMenuController } from '../page-editor-menu-controller';
import { PageBackgroundSelectorComponent } from '../../../components';

@Component({
  standalone: true,
  imports: [
    OnigiriIconComponent,
    PortalModule,
    OverlayModule,
    ComingSoonChipComponent,
    TooltipModule,
    CdkPortal,
    PageBackgroundSelectorComponent
  ],
  selector: 'appearance-menu',
  templateUrl: 'appearance-menu.component.html',
  styleUrl: 'appearance-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppearanceMenuComponent implements OnInit {
  #mediator = inject(PageEditorMediator);
  #overlay = inject(Overlay);
  #menuEditor = inject(PageEditorMenuController);

  viewStore = inject(PageViewStore);
  pageDataStore = inject(PageDataStore);

  bgSelectorTrigger =
    viewChild<ElementRef<HTMLDivElement>>('bgSelectorTrigger');

  bgSelectPanel = viewChild('bgSelectPanel', { read: CdkPortal });

  ngOnInit() {}

  showBGColorSelector() {
    if (this.viewStore.onMobileDevice()) {
      this.#mediator.send({
        _type: 'edit-bg'
      });
    } else {
      // const config = new OverlayConfig({
      //   positionStrategy: this.#overlay
      //     .position()
      //     .flexibleConnectedTo(this.bgSelectorTrigger)
      // });

      const positionStrategy = this.#overlay
        .position()
        .flexibleConnectedTo(this.bgSelectorTrigger()!.nativeElement)
        .withPositions([
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'top',
            offsetY: -96
          }
        ]);

      const overlayRef = this.#overlay.create({
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        positionStrategy
      });

      overlayRef.attach(this.bgSelectPanel());
      overlayRef.backdropClick().subscribe(() => overlayRef.detach());
    }
  }

  onMoveBack() {
    this.#menuEditor.setMode('add_tile');
  }
}
