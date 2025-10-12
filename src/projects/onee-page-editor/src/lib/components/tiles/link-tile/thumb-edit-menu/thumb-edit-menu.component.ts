import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { ThumbImageViewModel } from '../thumb-image/thumb-image.viewmodel';
import { OnigiriIconComponent } from '@oni-shared';
import { CdkPortal } from '@angular/cdk/portal';
import { animate, style, transition, trigger } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, Subject, take } from 'rxjs';

type MouseState = 'over' | 'away';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'link-tile-thumb-edit-menu',
  templateUrl: 'thumb-edit-menu.component.html',
  styleUrl: 'thumb-edit-menu.component.scss',
  animations: [
    trigger('imgEditMenuAnimation', [
      // state(':enter', style({
      //     opacity: 0,
      //     transform: 'scale(0.8)'
      // })),
      // state(':leave', style({
      //     opacity: 1,
      //     transform: 'scale(1)'
      // })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [animate('500ms', style({ opacity: 0 }))])
    ])
  ]
})
export class LinkTileThumbEditMenuComponent implements OnInit {
  target = input.required<HTMLDivElement>();
  vm = inject(ThumbImageViewModel);
  #overlay = inject(Overlay);
  #destroyRef = inject(DestroyRef);

  visible = signal(false);

  constructor() {}

  customImageSelector =
    viewChild<ElementRef<HTMLInputElement>>('thumbImageSelector');

  editImageMenu = viewChild('editImgMenu', { read: CdkPortal });

  ngOnInit() {
    this.vm.onSelectCustomImage
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.customImageSelector()?.nativeElement.click());
  }

  showEditImageMenu() {
    const target = this.target();

    const positionStrategy = this.#overlay
      .position()
      .flexibleConnectedTo(target)
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 0
        }
      ]);

    const overlayRef = this.#overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      // scrollStrategy: this.#overlay.scrollStrategies.close(),
      positionStrategy,
      width: target.clientWidth,
      height: target.clientHeight
    });

    overlayRef.attach(this.editImageMenu());
    const destroy = () => {
      overlayRef.detach();
      overlayRef.dispose();
    };

    overlayRef.backdropClick().subscribe(destroy);
  }
}
