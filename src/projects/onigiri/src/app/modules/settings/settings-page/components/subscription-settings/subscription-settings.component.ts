import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import {
  APP_SUBSCRIPTION_OPTIONS,
  AppSubscriptionKey,
  TRACKING
} from '@onigiri-models';
import { AccountStore, TrackingStore } from '@onigiri-store';
import { tap, pipe, exhaustMap } from 'rxjs';
import { format } from 'date-fns';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { OnigiriButtonComponent } from '@oni-shared';
import { SubscriptionCardComponent } from '@onigiri-shared/components/subscription-card/subscription-card.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { SubscriptionsApiService } from '@onigiri-api';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

interface UserSubscriptionInfo {
  name: string;
  status: string;
  billingInterval: string;
  monthlyPrice: number;
  expiresOn: string;
}

@UntilDestroy()
@Component({
  selector: 'subscription-settings',
  standalone: true,
  templateUrl: './subscription-settings.component.html',
  styleUrls: ['./subscription-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    OnigiriButtonComponent,
    InputSwitchModule,
    SubscriptionCardComponent
  ]
})
export class SubscriptionSettingsComponent implements OnInit {
  #api = inject(SubscriptionsApiService);
  #tracking = inject(TrackingStore);
  account = inject(AccountStore);

  isTrial = computed(() => this.account.subscription().type === 'trial');

  isExpiredOrNotActive = computed(() => {
    const subscription = this.account.subscription();
    const expired = subscription && subscription.expiresAt <= new Date();
    const notActive =
      subscription?.type === 'enterprise' && subscription.status !== 'active';

    return expired || notActive;
  });

  showUpgradeOptions = computed(() => {
    return this.isTrial() || this.isExpiredOrNotActive();
  });

  showSubscriptionInfo = computed(() => {
    return !this.isTrial() && !this.isExpiredOrNotActive();
  });

  subscriptionInfo = computed(() => {
    const data = this.account.subscription();
    if (data.type === 'trial') {
      return null;
    }

    const product = APP_SUBSCRIPTION_OPTIONS.find(
      x => x.key === 'growing_business'
    )!;

    return {
      name: 'Growing business',
      status: data.status,
      billingInterval: data.billingInterval === 'month' ? 'monthly' : 'yearly',
      monthlyPrice:
        data.billingInterval === 'month'
          ? product.price.monthly
          : product.price.yearly,
      expiresOn: format(data.expiresAt, 'd MMMM, yyyy')
    };
  });

  showYearly = false;
  subscriptionOptions = APP_SUBSCRIPTION_OPTIONS;

  ngOnInit(): void {}

  onUpgradeSubscription = rxMethod<AppSubscriptionKey>(
    pipe(
      tap(() =>
        this.#tracking.trackEvent(TRACKING.SUBSCRIPTION.UPGRADE_REQUEST)
      ),
      exhaustMap(key => {
        const returnUrl = window.location.toString();
        const billingInterval = this.showYearly ? 'year' : 'month';

        return this.#api
          .createCheckoutSession({ key, billingInterval, returnUrl })
          .pipe(tapResponse(url => window.location.replace(url), constVoid));
      })
    )
  );

  onEditCurrentSubscription = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        const returnUrl = window.location.toString();

        return this.#api
          .createCustomerPortalSession(returnUrl)
          .pipe(tapResponse(url => window.location.replace(url), constVoid));
      })
    )
  );
}
