import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InvoiceEditorStore } from '../../invoice-editor.store';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { exhaustMap, filter, pipe, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { getCurrentUrlWithExtraQueryParams, OnigiriButtonComponent } from '@oni-shared';
import { ActivatedRoute } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { IntegrationsApiService } from '@onigiri-api';
import { tapResponse } from '@ngrx/operators';
import { AccountStore } from '@onigiri-store';

@Component({
  standalone: true,
  selector: 'invoice-payment-options',
  templateUrl: 'invoice-payment-options.component.html',
  styleUrl: 'invoice-payment-options.component.scss',
  imports: [
    AsyncPipe, ReactiveFormsModule,
    InputTextareaModule, CheckboxModule,
    OnigiriButtonComponent
  ],
})
export class InvoicePaymentOptionsComponent implements OnInit {

  #activatedRoute = inject(ActivatedRoute);
  #account = inject(AccountStore);
  #integrationsApi = inject(IntegrationsApiService);

  editorStore = inject(InvoiceEditorStore);
  processingStripeRequest = signal(false);


  stripeEnabled = new FormControl<boolean>(false, { nonNullable: true });

  transferPayment = new FormGroup({
    enabled: new FormControl<boolean>(false, { nonNullable: true }),
    details: new FormControl<string | null>(null)
  });

  stripeIsConnected = computed(
    () => this.#account.integrations().stripe
  );

  constructor() {
    this.#handleStripeRedirect();
    this.#setupSync();
  }

  ngOnInit() {

  }

  connectStripe = rxMethod<Event>(pipe(
    tap(ev => ev.stopImmediatePropagation()),
    exhaustMap(_ => {
      this.processingStripeRequest.set(true);
      const returnUrl = getCurrentUrlWithExtraQueryParams({ stripeRedirect: true });

      return this.#integrationsApi.createStripeConnectUrl(returnUrl).pipe(
        tapResponse(
          redirectUrl => {
            window.location.href = redirectUrl;
          },
          () => {
            this.processingStripeRequest.set(false);
          }
        )
      );
    })
  ));

  #handleStripeRedirect() {
    this.#activatedRoute.queryParamMap.pipe(
      filter(params => params.has('stripeRedirect')),
      tap(() => this.processingStripeRequest.set(true)),
      exhaustMap(() => this.#integrationsApi.refreshStripeIntegrationState().pipe(
        tapResponse(
          () => {
            this.#account.refreshUserInfo();
            setTimeout(() => this.processingStripeRequest.set(false), 800);
          },
          () => this.processingStripeRequest.set(false)
        )
      )),
      takeUntilDestroyed()
    ).subscribe();
  }

  #setupSync() {

    this.editorStore.paymentOptions.pipe(
      takeUntilDestroyed()
    ).subscribe(options => {

      const transferPayment = options.find(x => x.type === 'transfer');
      const transferPaymentFormValue = this.transferPayment.value;

      const stripeEnabled = options.some(x => x.type === 'stripe' && x.enabled);

      if (transferPayment &&
        (transferPayment.enabled !== transferPaymentFormValue.enabled ||
          transferPayment.details !== transferPaymentFormValue.details)) {

        this.transferPayment.patchValue({
          enabled: transferPayment.enabled,
          details: transferPayment.details
        }, { emitEvent: false });
      }

      if (this.stripeEnabled.value !== stripeEnabled) {
        this.stripeEnabled.setValue(stripeEnabled, { emitEvent: false });
      }
    });

    this.transferPayment.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(fv => {
      this.editorStore.updatePaymentOption({
        type: 'transfer',
        enabled: fv.enabled || false,
        details: fv.details || null
      });
    });

    this.stripeEnabled.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(enabled => {
      this.editorStore.updatePaymentOption({
        type: 'stripe',
        enabled: enabled
      });
    })

  }
}