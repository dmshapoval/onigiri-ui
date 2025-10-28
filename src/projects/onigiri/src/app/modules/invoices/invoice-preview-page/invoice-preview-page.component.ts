import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedInvoiceLinkData, stripePaymentEnabled, TRACKING } from '@onigiri-models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { of, exhaustMap, map, switchMap, pipe } from 'rxjs';
import { TrackingStore } from '@onigiri-store';
import { OnigiriButtonComponent, CopyLinkButtonComponent } from '@oni-shared';
import { OnigiriRefFooterComponent } from '@onigiri-shared/components/onigiri-ref-footer.component';
import { AsyncPipe } from '@angular/common';
import { DownloadInvoicePDFButtonComponent } from '../components/download-invoice-pdf-button.component';
import { InvoiceViewComponent } from '../components/invoice-view/invoice-view.component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Dialog } from '@angular/cdk/dialog';
import { PaymentDetailsDialogComponent } from '../components/payment-details-dialog/payment-details-dialog.component';
import { tapResponse } from '@ngrx/operators';

import { TransferInvoicePaymentOptionDto } from '../../../api-v2/contracts/invoices';
import isEmpty from 'lodash/isEmpty';
import { InvoiceStripePaymentDialogComponent } from '../components/invoice-stripe-payment-dialog/invoice-stripe-payment-dialog.component';
import { IntegrationsApiService, InvoicesApiService, StripePaymentsApiService } from '@onigiri-api';
import { constVoid } from 'fp-ts/es6/function';
import { AppNavStore } from '../../../store/app-nav.store';


@UntilDestroy()
@Component({
  selector: 'app-invoice-preview-page',
  standalone: true,
  templateUrl: './invoice-preview-page.component.html',
  styleUrls: ['./invoice-preview-page.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CopyLinkButtonComponent, InvoiceViewComponent,
    OnigiriRefFooterComponent, PaymentDetailsDialogComponent,
    OnigiriButtonComponent, DownloadInvoicePDFButtonComponent,
    InvoiceStripePaymentDialogComponent
  ]
})
export class InvoicePreviewPageComponent implements OnInit {

  #route = inject(ActivatedRoute);
  #invoicesApi = inject(InvoicesApiService);
  #navStore = inject(AppNavStore);
  #tracking = inject(TrackingStore);
  #dialogs = inject(Dialog);
  #stripePayments = inject(StripePaymentsApiService);

  #isStripeRedirect = signal(false);
  #invoiceId = signal<string | null>(null);
  #stripeSessionId = signal<string | null>(null);

  invoiceData = signal<SharedInvoiceLinkData | null>(null);
  invoiceLink = signal<string | null>(null);

  isPaid = computed(() => this.invoiceData()?.is_paid || false);

  transferDetails = computed(() => {
    const data = this.invoiceData();

    if (!data) { return ''; }

    const { payment_options } = data;

    const transferDetails = payment_options
      .find(x => x.type === 'transfer') as TransferInvoicePaymentOptionDto | undefined;

    return transferDetails && transferDetails.enabled
      ? transferDetails.data.details
      : '';
  });

  allowStripePayment = computed(() => {
    const data = this.invoiceData();
    return data && data.stripe_payments_enabled; //.is_paid && stripePaymentEnabled(data);
  });

  allowTransfer = computed(() => {
    const data = this.invoiceData();
    return data && !data.is_paid && !isEmpty(this.transferDetails())
  });

  constructor() {
    this.#setupEffects();
  }

  ngOnInit() {

    this.#tracking.setTrackingSource('Invoice Preview');

    this.#route.paramMap
      .pipe(map(x => x.get('id') || null), untilDestroyed(this))
      .subscribe(id => this.#invoiceId.set(id));

    this.#route.queryParamMap
      .pipe(map(x => x.get('session_id') || null), untilDestroyed(this))
      .subscribe(id => this.#stripeSessionId.set(id));

    this.#route.paramMap
      .pipe(map(x => x.get('stripe_redirect') || null), untilDestroyed(this))
      .subscribe(x => this.#isStripeRedirect.set(x === 'true'));
  }

  // TODO; refactor
  handlePDFRequest = () => {
    const invoiceId = this.#invoiceId();

    if (!invoiceId) { return of(''); }

    return this.#invoicesApi.generatePDF(invoiceId)
      .pipe(tapResponse(
        () => this.#tracking.trackEvent(
          TRACKING.INVOICE.PDF_DOWNLOAD
        ),
        constVoid)
      );
  }

  onClose() {
    const defaultRoute = `./invoices/${this.#invoiceId()}`;

    this.#navStore.navigateBack(defaultRoute);
  }

  onLinkCopied() {
    this.#tracking.trackEvent(
      TRACKING.INVOICE.SHARE_LINK_COPY
    );
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
      const invoiceId = this.#invoiceId();

      if (!invoiceId) {
        return of();
      }
      const getSession = () =>
        this.#stripePayments.initInvoiceStripePayment(invoiceId, window.location.href);

      const onComplete = (sessionId: string) =>
        this.#refreshInvoicePaymentStatus({ invoiceId, sessionId });

      const dialog = this.#dialogs.open(InvoiceStripePaymentDialogComponent, {
        width: '600px',
        data: { getSession, onComplete }
      });

      return dialog.closed;
    })
  );

  #loadInvoiceData = rxMethod<string | null>(pipe(
    switchMap(invoiceId => {

      if (!invoiceId) {
        this.invoiceData.set(null);
        return of();
      }

      return this.#invoicesApi.getSharedInvoiceData(invoiceId).pipe(
        tapResponse(
          v => this.invoiceData.set(v),
          () => this.invoiceData.set(null)
        )
      );
    }))
  );

  #loadInvoiceLink = rxMethod<string | null>(pipe(
    switchMap(invoiceId => {

      if (!invoiceId) {
        this.invoiceLink.set(null);
        return of();
      }

      return this.#invoicesApi.getPublicLink(invoiceId).pipe(
        tapResponse(
          v => this.invoiceLink.set(v),
          () => this.invoiceLink.set(null)
        )
      )
    }))
  );

  #refreshInvoicePaymentStatus = rxMethod<{ invoiceId: string, sessionId: string }>(pipe(
    exhaustMap(({ invoiceId, sessionId }) => this.#stripePayments
      .checkInvoiceStripePaymentStatus(sessionId).pipe(
        tapResponse(
          () => {

            // TODO setup new status polling
            setTimeout(() => {
              this.#loadInvoiceData(invoiceId);
            }, 3000);
          },
          constVoid
        )
      ))));

  #setupEffects() {
    effect(() => {
      const invoiceId = this.#invoiceId();
      this.#loadInvoiceData(invoiceId);
      this.#loadInvoiceLink(invoiceId);
    });

    effect(() => {
      const isStripeRedirect = this.#isStripeRedirect();
      const sessionId = this.#stripeSessionId();
      const invoiceId = this.#invoiceId();

      if (!isStripeRedirect || !invoiceId || !sessionId) { return; }

      this.#refreshInvoicePaymentStatus({ invoiceId, sessionId });

    });
  }

}


// exhaustMap(_ => {
//   const invoiceId = this.#invoiceId();

//   if (!invoiceId) {
//     return of();
//   }

//   const successReturnUrl = getCurrentUrlWithExtraQueryParams({ successStripeRedirect: true });
//   const cancelReturnUrl = getCurrentUrlWithExtraQueryParams({ cancelStripeRedirect: true });

//   return this.#invoicesApi.initStripePayment(invoiceId, successReturnUrl, cancelReturnUrl).pipe(
//     tapResponse(
//       redirectUrl => window.location.href = redirectUrl,
//       constVoid
//     )
//   );
// })