import {
  ChangeDetectorRef,
  Directive,
  effect,
  HostBinding,
  inject
} from '@angular/core';
import { PageDataStore } from '../page-data.store';
import { PageViewStore } from '../view.store';

@Directive({ selector: '[withLayoutCls]', standalone: true })
export class WithLayoutClsDirective {
  #dataStore = inject(PageDataStore);
  #viewStore = inject(PageViewStore);

  @HostBinding('class.profile-left')
  isProfileLeft = false;

  @HostBinding('class.profile-right')
  isProfileRight = false;

  @HostBinding('class.profile-top')
  isProfileTop = false;

  @HostBinding('class.mobile-view')
  isMobileView = false;

  @HostBinding('class.desktop-view')
  isDesktopView = false;

  #cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const layout = this.#dataStore.layout();
      const view = this.#viewStore.viewType();

      this.isProfileLeft = layout === 'profile_left';
      this.isProfileRight = layout === 'profile_right';
      this.isProfileTop = layout === 'profile_top';

      this.isMobileView = view === 'mobile';
      this.isDesktopView = view === 'desktop';

      this.#cdr.markForCheck();
    });
  }
}
