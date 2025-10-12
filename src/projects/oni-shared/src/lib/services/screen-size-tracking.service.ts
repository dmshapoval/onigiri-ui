import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { constVoid } from 'fp-ts/es6/function';
import {
  filter,
  fromEvent,
  map,
  Observable,
  shareReplay,
  startWith
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScreenSizeTrackingService {
  // #rendererFactory = inject(RendererFactory2);
  #currentScale = 1;

  deviceSize: Observable<number>;

  constructor() {
    this.#setupTrackingEl();
    // this.#setupRescale();
  }

  #setupTrackingEl() {
    const el = document.createElement('div');
    el.classList.add('absolute', 'w-screen', 'bottom-0', 'left-0');
    document.body.appendChild(el);

    this.deviceSize = fromEvent(window, 'resize').pipe(
      startWith(constVoid()),
      map(() => el.clientWidth),
      map(w => Math.floor(w * this.#currentScale)),
      shareReplay(1)
    );
  }

  // #setupRescale() {
  //   const metaEl = document.querySelector('meta[name=viewport]');
  //   const renderer = this.#rendererFactory.createRenderer(null, null);

  //   this.deviceSize
  //     .pipe(
  //       map(w => (w >= 430 ? 1.0 : Math.max(w / 430, 0.75))),
  //       filter(newScale => Math.abs(newScale - this.#currentScale) > 0.03),
  //       takeUntilDestroyed()
  //     )
  //     .subscribe(newScale => {
  //       this.#currentScale = newScale;
  //       const content = `width=device-width, initial-scale=${newScale}, maximum-scale=1.0`;
  //       renderer.setAttribute(metaEl, 'content', content);
  //     });
  // }
}
