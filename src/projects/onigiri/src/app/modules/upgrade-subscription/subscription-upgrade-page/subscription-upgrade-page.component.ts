import { AsyncPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OnigiriButtonComponent, isNotNil } from '@oni-shared';
import { APP_SUBSCRIPTION_OPTIONS, AppSubscriptionKey, AppSubscriptionOption, TRACKING } from '@onigiri-models';
import { AccountStore, TrackingStore } from '@onigiri-store';
import { InputSwitchModule } from 'primeng/inputswitch';
import { exhaustMap, map, pipe, tap, throttleTime, withLatestFrom } from 'rxjs';
import { SubscriptionCardComponent } from '../../../shared/components/subscription-card/subscription-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { SubscriptionsApiService } from '@onigiri-api';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';
import { AppNavStore } from '../../../store/app-nav.store';

@UntilDestroy()
@Component({
  selector: 'app-subscription-upgrade-page',
  standalone: true,
  templateUrl: './subscription-upgrade-page.component.html',
  styleUrls: ['./subscription-upgrade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent, FormsModule,
    InputSwitchModule, SubscriptionCardComponent,
    AsyncPipe
  ]
})
export class SubscriptionUpgradePageComponent implements OnInit {

  #location = inject(Location);
  #router = inject(Router);
  #route = inject(ActivatedRoute);
  #tracking = inject(TrackingStore);
  #account = inject(AccountStore);
  #navStore = inject(AppNavStore);
  #api = inject(SubscriptionsApiService);


  showYearly = false;

  subscriptionOptions = APP_SUBSCRIPTION_OPTIONS;

  freeSubscription: AppSubscriptionOption = {
    key: 'free',
    name: 'Free. Page Lover',
    price: { monthly: 0, yearly: 0 },
    disabled: false,
    features: {
      title: 'Key Features',
      list: [
        'Personal Page where you can showcase the things that matter'
      ]
    }
  };

  currentUserSubscription = computed(() => {
    const oniSubscr = this.#account.subscription();

    return (oniSubscr && oniSubscr.type === 'enterprise')
      ? 'Growing Business'
      : 'Growing Business free trial';
  })


  showPagesAccessNotification$ = this.#route.queryParamMap.pipe(
    map(p => p.get('pageAccessNotification')),
    map(isNotNil)
  );


  ngOnInit(): void {
    this.#tracking.setTrackingSource('Upgrade Page');
  }

  onUpgradeSubscription = rxMethod<AppSubscriptionKey>(pipe(
    tap(() => this.#tracking.trackEvent(TRACKING.SUBSCRIPTION.UPGRADE_REQUEST)),
    exhaustMap(key => {
      const prevRoute = this.#navStore.prevRoute(); // TODO verify
      const returnUrl = `${window.location.origin}${prevRoute || '/invoices'}`;

      const billingInterval = this.showYearly ? 'year' : 'month';

      return this.#api.createCheckoutSession({ key, billingInterval, returnUrl }).pipe(
        tapResponse(
          url => window.location.replace(url),
          constVoid
        )
      )
    })
  ));

  onCancel = rxMethod<void>(pipe(
    throttleTime(500),
    tap(() => {
      const qp = this.#route.snapshot.queryParamMap;
      const fromGuard = qp.get('fromGuard') === 'true';
      const cancelRoute = qp.get('cancelRoute');

      if (cancelRoute) {
        this.#router.navigateByUrl(`/${cancelRoute}`);
      } else if (fromGuard) {
        this.#router.navigateByUrl('/settings');
      } else {
        this.#location.back();
      }
    })
  ));
}
