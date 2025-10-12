import { Directive, effect, HostBinding, inject } from '@angular/core';
import { PageViewStore } from '../view.store';

@Directive({ selector: '[hideOnMobile]', standalone: true })
export class HideOnMobileDirective {
  @HostBinding('class.hidden')
  isHidden = false;

  #viewStore = inject(PageViewStore);

  constructor() {
    effect(() => {
      this.isHidden = this.#viewStore.onMobileDevice();
    });
  }
}
