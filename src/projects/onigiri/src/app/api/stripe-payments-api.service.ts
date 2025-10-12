import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@oni-shared';
import { InvoiceCheckoutSessionData } from '@onigiri-models';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripePaymentsApiService {

  #http = inject(HttpClient);
  #api = inject(APP_CONFIG).onigiriApi;

  initInvoiceStripePayment(invoiceId: string, returnUrl: string): Observable<InvoiceCheckoutSessionData> {
    return this.#http
      .post<InvoiceCheckoutSessionData>(
        `${this.#api}/api/invoices/stripe-payments`,
        { invoiceId, returnUrl }
      );
  }

  checkInvoiceStripePaymentStatus(sessionId: string) {
    return this.#http.post<void>(
      `${this.#api}/api/invoices/stripe-payments/${sessionId}/check-status`,
      null
    );
  }

  initSharedInvoiceStripePayment(linkId: string, returnUrl: string): Observable<InvoiceCheckoutSessionData> {
    return this.#http
      .post<InvoiceCheckoutSessionData>(
        `${this.#api}/api/invoices/public-links/${linkId}/actions/stripe-payments`,
        { returnUrl }
      );
  }

  checkSharedInvoiceStripePaymentStatus(linkId: string, sessionId: string) {
    return this.#http.post<void>(
      `${this.#api}/api/invoices/public-links/${linkId}/actions/stripe-payments/${sessionId}/check-status`,
      null
    );
  }
}
