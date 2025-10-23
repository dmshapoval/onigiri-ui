import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AccountStore, BusinessInfoStore } from '@onigiri-store';
import {
  concatMap,
  debounceTime,
  exhaustMap,
  filter,
  pipe,
  tap,
  timer
} from 'rxjs';
import { BusinessesApiService, IntegrationsApiService } from '@onigiri-api';
import {
  OnigiriButtonComponent,
  ComingSoonChipComponent,
  getCurrentUrlWithExtraQueryParams
} from '@oni-shared';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { tapResponse } from '@ngrx/operators';

import { constVoid } from 'fp-ts/es6/function';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'payments-settings',
  standalone: true,
  templateUrl: './payments-settings.component.html',
  styleUrls: ['./payments-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent,
    ReactiveFormsModule,
    InputTextareaModule,
    TooltipModule
  ]
})
export class PaymentsSettingsComponent implements OnInit {
  #api = inject(BusinessesApiService);
  #businessEntitiesStore = inject(BusinessInfoStore);
  #integrationsApi = inject(IntegrationsApiService);
  #activatedRoute = inject(ActivatedRoute);

  account = inject(AccountStore);
  paymentDefaultsControl = new FormControl<string | null>(null);

  processingStripeRequest = signal(false);
  showDisconnectError = signal(false);

  // userInfo = this.#store.pipe(select(selectAppUser));

  // stripeIsConnected = this.#store.pipe(
  //   select(selectAppUser),
  //   map(x => x && x.integrations.stripe)
  // );

  constructor() {
    this.#setupFormValueSync();
    this.#setupStripeRedirectHandler();
  }

  ngOnInit() {
    const paymentDefaults = this.#businessEntitiesStore.paymentDefaults();
    this.paymentDefaultsControl.setValue(paymentDefaults, { emitEvent: false });
  }

  connectStripe = rxMethod<void>(
    exhaustMap(_ => {
      this.processingStripeRequest.set(true);
      const returnUrl = getCurrentUrlWithExtraQueryParams({
        stripeRedirect: true
      });

      return this.#integrationsApi.createStripeConnectUrl(returnUrl).pipe(
        tapResponse(
          redirectUrl => {
            this.processingStripeRequest.set(false);
            window.location.replace(redirectUrl);
          },
          () => {
            this.processingStripeRequest.set(false);
          }
        )
      );
    })
  );

  disconnectStripe = rxMethod<void>(
    pipe(
      tap(() => this.processingStripeRequest.set(true)),
      exhaustMap(() => {
        return timer(1500).pipe(
          tap(() => {
            this.processingStripeRequest.set(false);
            this.showDisconnectError.set(true);
          })
        );
      })
    )
  );

  #setupStripeRedirectHandler() {
    this.#activatedRoute.queryParamMap
      .pipe(
        filter(params => params.has('stripeRedirect')),
        tap(() => this.processingStripeRequest.set(true)),
        exhaustMap(() =>
          this.#integrationsApi.refreshStripeIntegrationState().pipe(
            tapResponse(
              () => {
                this.account.refreshUserInfo();
                setTimeout(() => this.processingStripeRequest.set(false), 800);
              },
              () => this.processingStripeRequest.set(false)
            )
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  #setupFormValueSync() {
    const entityId = this.#businessEntitiesStore.entityId();

    this.paymentDefaultsControl.valueChanges
      .pipe(
        debounceTime(300),
        concatMap(paymentDefaults =>
          this.#api.updateBusinessEntity(entityId, { paymentDefaults }).pipe(
            tapResponse(
              () => this.#businessEntitiesStore.dataChanged({ paymentDefaults }),
              constVoid
            )
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }
}
