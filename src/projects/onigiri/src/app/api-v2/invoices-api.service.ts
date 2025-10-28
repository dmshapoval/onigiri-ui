import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Currency,
  InvoiceDiscount,
  InvoiceInfo,
  InvoiceLine,
  InvoicePaymentOption,
  InvoiceTax,
  SharedInvoiceLinkData,
} from '@onigiri-models';
import * as A from 'fp-ts/es6/Array';
import { Observable, map } from 'rxjs';
import {
  InvoiceDraftDataDto,
  InvoiceDto,
  InvoiceInfoDto,
  InvoicePDFRequestResultDto,
  SendInvoiceRequestDto,
  toInvoice,
  toInvoiceDiscountDto,
  toInvoiceInfo,
  toInvoiceLineDto,
  toInvoicePaymentOptionDto,
  toInvoiceTaxDto,
} from './contracts/invoices';
import { toLocalDateDto } from './contracts/date-time';
import { APP_CONFIG } from '@oni-shared';

@Injectable({ providedIn: 'root' })
export class InvoicesApiService {
  #http = inject(HttpClient);
  #onigiriApi = inject(APP_CONFIG).onigiriApi;


  generatePDF(invoiceId: string) {
    return this.#http
      .get<InvoicePDFRequestResultDto>(
        `${this.#onigiriApi}/api/invoices/${invoiceId}/pdf`,
        {}
      )
      .pipe(map((x) => x.url));
  }

  getUserInvoices(): Observable<InvoiceInfo[]> {
    return this.#http
      .get<InvoiceInfoDto[]>(`${this.#onigiriApi}/api/invoices`)
      .pipe(map(A.map(toInvoiceInfo)));
  }

  createInvoice(projectId?: string) {
    const data: InvoiceDraftDataDto = {
      customer: null, // TODO
      project: projectId || null,
    };

    return this.#http
      .post<InvoiceDto>(`${this.#onigiriApi}/api/invoices`, data)
      .pipe(map(toInvoice));
  }

  createInvoiceCopy(invoiceId: string) {
    return this.#http
      .post<InvoiceDto>(
        `${this.#onigiriApi}/api/invoices/${invoiceId}/copy`,
        null
      )
      .pipe(map(toInvoice));
  }

  getInvoice(id: string) {
    return this.#http
      .get<InvoiceDto>(`${this.#onigiriApi}/api/invoices/${id}`)
      .pipe(map(toInvoice));
  }

  deleteInvoice(id: string) {
    return this.#http.delete<void>(`${this.#onigiriApi}/api/invoices/${id}`);
  }

  updateTitle(id: string, title: string | null): Observable<void> {
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/title`, { title });
  }

  updateNo(id: string, no: string | null): Observable<void> {
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/no`, { no });
  }

  updatePaymentOptions(id: string, data: InvoicePaymentOption[]): Observable<void> {
    const payload = data.map(toInvoicePaymentOptionDto);

    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/payment-options`,
      payload
    );
  }

  setDraftStatus(id: string): Observable<void> {
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/status`, { type: 'draft' });
  }

  setSentStatus(id: string, sentOn: Date): Observable<void> {
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/status`, {
      type: 'sent',
      data: { date: toLocalDateDto(sentOn) }
    });
  }

  setPaidStatus(id: string, paidOn: Date): Observable<void> {
    const payload = {
      type: 'paid',
      data: { date: toLocalDateDto(paidOn) }
    }
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/status`, payload);
  }

  setOverdueStatus(id: string): Observable<void> {
    return this.#http.put<void>(`${this.#onigiriApi}/api/invoices/${id}/status`, { type: 'overdue' });
  }

  updateNotes(id: string, notes: string | null): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/notes`,
      { notes }
    );
  }

  updateCurrency(id: string, currency: Currency): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/currency`,
      { currency }
    );
  }

  updateDate(id: string, date: Date | null): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/date`,
      { date: date ? toLocalDateDto(date) : null }
    );
  }

  updateDueDate(id: string, date: Date | null): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/due-date`,
      { date: date ? toLocalDateDto(date) : null }
    );
  }

  updateProject(id: string, projectId: string | null): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/project`,
      { project_id: projectId }
    );
  }

  updateBilledTo(id: string, customerId: string | null): Observable<void> {
    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/billed-to`,
      { billed_to: customerId }
    );
  }

  updateLines(id: string, data: InvoiceLine[]): Observable<void> {
    const payload = data.map(toInvoiceLineDto);

    return this.#http.put<void>(
      `${this.#onigiriApi}/api/invoices/${id}/lines`,
      payload
    );
  }

  updateTax(id: string, data: InvoiceTax | null): Observable<void> {

    return data
      ? this.#http.put<void>(
        `${this.#onigiriApi}/api/invoices/${id}/tax`,
        toInvoiceTaxDto(data)
      )
      : this.#http.delete<void>(`${this.#onigiriApi}/api/invoices/${id}/tax`);
  }

  updateDiscount(id: string, data: InvoiceDiscount | null): Observable<void> {
    return data
      ? this.#http.put<void>(
        `${this.#onigiriApi}/api/invoices/${id}/discount`,
        toInvoiceDiscountDto(data)
      )
      : this.#http.delete<void>(`${this.#onigiriApi}/api/invoices/${id}/discount`);
  }

  sendInvoice(
    invoiceId: string,
    recipients: string[],
    copiesTo: string[],
    message: string | null
  ) {
    const payload: SendInvoiceRequestDto = {
      recipients,
      cc: copiesTo,
      message,
    };

    return this.#http.post<void>(
      `${this.#onigiriApi}/api/invoices/${invoiceId}/send`,
      payload
    );
  }

  getPublicLink(invoiceId: string): Observable<string> {
    return this.#http.get<{ link: string }>(
      `${this.#onigiriApi}/api/invoices/${invoiceId}/public-link`
    ).pipe(map(x => x.link));
  }

  getSharedInvoiceData(invoiceId: string) {
    return this.#http.get<SharedInvoiceLinkData>(
      `${this.#onigiriApi}/api/invoices/${invoiceId}/public-link-data`
    );
  }

  // initStripePayment(invoiceId: string, returnUrl: string): Observable<InvoiceCheckoutSessionData> {
  //   return this.#http
  //     .post<{ client_secret: string; account_id: string }>(`${this.#onigiriApi}/api/invoices/${invoiceId}/stripe-payment`, {
  //       return_url: returnUrl,
  //     })
  //     .pipe(map(x => ({
  //       accountId: x.account_id,
  //       clientSecret: x.client_secret
  //     })));
  // }

  // initStripePayment(invoiceId: string) {
  //   return this.#http
  //     .post<{ client_secret: string }>(`${this.#onigiriApi}/api/invoices/${invoiceId}/stripe-payment`, null)
  //     .pipe(map(x => x.client_secret));
  // }
}