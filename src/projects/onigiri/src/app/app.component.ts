import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BusinessesApiService } from '@onigiri-api';
import { AppNavStore } from './store/app-nav.store';
import { BusinessInfoStore } from '@onigiri-store';
import { ScreenSizeTrackingService } from '@oni-shared';

@UntilDestroy()
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  #router = inject(Router);

  // NOTE: we need to initialize on the app start to catch all router events
  #navStore = inject(AppNavStore);
  #businessesStore = inject(BusinessInfoStore);
  #screenSizeTracking = inject(ScreenSizeTrackingService);

  private _auth = inject(Auth);
  private _accountsApi = inject(BusinessesApiService);

  ngOnInit() {
    // this.#router.events.pipe(untilDestroyed(this)).subscribe
    // authState(this._auth)
    //   .pipe(
    //     whenIsNotNull,
    //     switchMap(() => this._accountsApi.getUserInfo().pipe(retry({ count: 5, delay: 500 }))),
    //     untilDestroyed(this))
    //   .subscribe(user => {
    //     this._store.dispatch(userInfoReceived({ user }));
    //   });
  }
}
