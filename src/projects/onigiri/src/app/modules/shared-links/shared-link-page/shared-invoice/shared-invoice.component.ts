import { Component, OnInit, inject, ChangeDetectionStrategy, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { IntegrationsApiService, SharedLinksApiService, StripePaymentsApiService } from '@onigiri-api';
import { of, pipe, distinctUntilChanged, exhaustMap, map, switchMap, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RequestStatus, SharedInvoiceLinkData, stripePaymentEnabled } from '@onigiri-models';
import { ActivatedRoute } from '@angular/router';
import { DownloadInvoicePDFButtonComponent } from '../../../invoices/components/download-invoice-pdf-button.component';
import { InvoiceViewComponent } from '../../../invoices/components/invoice-view/invoice-view.component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Dialog } from '@angular/cdk/dialog';
import { PaymentDetailsDialogComponent } from '../../../invoices/components/payment-details-dialog/payment-details-dialog.component';
import { TransferInvoicePaymentOptionDto } from '../../../../api-v2/contracts/invoices';
import isEmpty from 'lodash/isEmpty';
import { OnigiriButtonComponent, getCurrentUrlWithExtraQueryParams } from '@oni-shared';
import { constVoid } from 'fp-ts/es6/function';
import { InvoiceStripePaymentDialogComponent } from '../../../invoices/components/invoice-stripe-payment-dialog/invoice-stripe-payment-dialog.component';
import { SkeletonModule } from 'primeng/skeleton';

@UntilDestroy()
@Component({
  selector: 'shared-invoice',
  standalone: true,
  templateUrl: './shared-invoice.component.html',
  styleUrl: './shared-invoice.component.scss',
  imports: [
    DownloadInvoicePDFButtonComponent, OnigiriButtonComponent,
    InvoiceViewComponent, PaymentDetailsDialogComponent,
    InvoiceStripePaymentDialogComponent, SkeletonModule
  ]
})
export class SharedInvoiceComponent implements OnInit {

  @Output() loadingStatus = new EventEmitter<RequestStatus>();

  #route = inject(ActivatedRoute);
  #api = inject(SharedLinksApiService);
  #dialogs = inject(Dialog);
  #stripePayments = inject(StripePaymentsApiService);

  #isStripeRedirect = signal(false);
  #stripeSessionId = signal<string | null>(null);
  refreshingPaymentStatus = signal(false);


  linkId = toSignal(
    this.#route.paramMap.pipe(
      map(x => x.get('linkId') || null),
      distinctUntilChanged()
    ), { initialValue: null });

  data = signal<SharedInvoiceLinkData | null>(null);

  transferDetails = computed(() => {
    const data = this.data();

    if (!data) { return ''; }

    const { payment_options } = data;

    const transferDetails = payment_options
      .find(x => x.type === 'transfer') as TransferInvoicePaymentOptionDto | undefined;

    return transferDetails && transferDetails.enabled
      ? transferDetails.data.details
      : '';
  });

  allowStripePayment = computed(() => {
    const data = this.data();
    return data && data.stripe_payments_enabled; //.is_paid && stripePaymentEnabled(data);
  });

  allowTransfer = computed(() => {
    const data = this.data();
    return data && !data.is_paid && !isEmpty(this.transferDetails())
  });

  constructor() {

    this.linkId = toSignal(
      this.#route.paramMap.pipe(
        map(x => x.get('linkId') || null),
        distinctUntilChanged()
      ),
      { initialValue: null });

    this.#setupEffects();
  }

  ngOnInit() {

    this.#route.queryParamMap
      .pipe(map(x => x.get('session_id') || null), untilDestroyed(this))
      .subscribe(id => this.#stripeSessionId.set(id));

    this.#route.paramMap
      .pipe(map(x => x.get('stripe_redirect') || null), untilDestroyed(this))
      .subscribe(x => this.#isStripeRedirect.set(x === 'true'));
  }

  handlePDFRequest = () => {
    const linkId = this.linkId();

    if (!linkId) {
      return of(null);
    }

    return this.#api.getSharedInvoicePDF(linkId);
  }

  showTransferDetails = rxMethod<void>(
    exhaustMap(_ => {
      const dialog = this.#dialogs.open(PaymentDetailsDialogComponent, {
        width: '600px',
        data: { details: this.transferDetails() }
      });

      return dialog.closed;
    })
  );

  payWithCard = rxMethod<void>(
    exhaustMap(_ => {
      const linkId = this.linkId();

      if (!linkId) {
        return of();
      }

      const getSession = () =>
        this.#stripePayments.initSharedInvoiceStripePayment(linkId, window.location.href);


      const onComplete = (sessionId: string) =>
        this.#refreshInvoicePaymentStatus({ linkId, sessionId });

      const dialog = this.#dialogs.open(InvoiceStripePaymentDialogComponent, {
        // width: '600px',
        data: { getSession, onComplete }
      });

      return dialog.closed;
    })
  );

  #loadData = rxMethod<{ linkId: string, isPaymentStatusRefresh: boolean }>(pipe(
    tap(({ isPaymentStatusRefresh }) => {
      if (!isPaymentStatusRefresh) {
        this.loadingStatus.emit('running');
      }
    }),
    switchMap(({ linkId, isPaymentStatusRefresh }) => {

      return this.#api.getInvoiceLinkData(linkId).pipe(
        tapResponse(
          data => {
            this.data.set(data);
            if (isPaymentStatusRefresh) {
              this.refreshingPaymentStatus.set(false);
            } else {
              this.loadingStatus.emit('completed');
            }
          },
          () => {
            if (isPaymentStatusRefresh) {
              this.refreshingPaymentStatus.set(false);
            } else {
              this.loadingStatus.emit('completed');
            }
          }
        )
      )
    })
  ));

  #refreshInvoicePaymentStatus = rxMethod<{ linkId: string, sessionId: string }>(pipe(
    exhaustMap(({ linkId, sessionId }) => this.#stripePayments
      .checkSharedInvoiceStripePaymentStatus(linkId, sessionId).pipe(
        tapResponse(
          () => {
            this.refreshingPaymentStatus.set(true);
            // TODO setup new status polling
            setTimeout(() => {
              this.#loadData({ linkId, isPaymentStatusRefresh: true });
            }, 3000);
          },
          constVoid
        )
      ))));

  #setupEffects() {

    effect(() => {
      const linkId = this.linkId();

      if (linkId) {
        this.#loadData({ linkId, isPaymentStatusRefresh: false });
      }
    })

    effect(() => {
      const linkId = this.linkId();

      const isStripeRedirect = this.#isStripeRedirect();
      const sessionId = this.#stripeSessionId();

      if (!isStripeRedirect || !sessionId || !linkId) { return; }

      this.#refreshInvoicePaymentStatus({ linkId, sessionId });
    });

  }
}