import { Injectable, effect, inject, signal } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  Currency,
  Customer,
  InovicePaymentOptionType,
  Invoice,
  InvoiceData,
  InvoiceDiscount,
  InvoiceLine,
  InvoicePaymentOption,
  InvoiceTax,
  toCurrencySymbol
} from '@onigiri-models';
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  filter,
  map,
  pipe,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs';

import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isTruthy, whenIsNotNull } from '@oni-shared';
import { BackgroundRequestsService } from '../../../services/bg-requests.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomersStore } from '@onigiri-store';
import { ActivatedRoute } from '@angular/router';
import { CustomersApiService, InvoicesApiService } from '@onigiri-api';
import { constVoid } from 'fp-ts/lib/function';

interface InvoiceEditorState {
  loadingState: 'loading' | 'loaded' | 'failed';
  error: string | null;
  invoice: InvoiceData | null;
}

type ApiRequestFactory = (invoiceId: string) => Observable<any>;

@UntilDestroy()
@Injectable()
export class InvoiceEditorStore extends ComponentStore<InvoiceEditorState> {
  #api = inject(InvoicesApiService);
  #customersApi = inject(CustomersApiService);
  #backgroundRequests = inject(BackgroundRequestsService);
  #customers = inject(CustomersStore);
  #route = inject(ActivatedRoute);

  constructor() {
    super({
      error: null,
      invoice: null,
      loadingState: 'loading'
    });

    this.#setupSelectedCustomer();
    this.#setupDataLoad();
  }

  invoiceId = this.#route.paramMap.pipe(
    map(x => x.get('id')),
    whenIsNotNull,
    distinctUntilChanged(),
    shareReplay(1)
  );

  //this.select(s => s.id).pipe(whenIsNotNull, distinctUntilChanged());

  isLoaded = this.select(s => s.loadingState).pipe(
    map(x => x === 'loaded'),
    distinctUntilChanged()
  );

  whenLoaded() {
    return this.isLoaded.pipe(filter(isTruthy), take(1));
  }

  loadingState = this.select(s => s.loadingState);
  invoiceData = this.select(s => s.invoice).pipe(whenIsNotNull);
  billedTo = this.select(s => s.invoice?.billedTo || null).pipe(
    distinctUntilChanged()
  );
  currency = this.select(this.invoiceData, s => s.currency).pipe(
    distinctUntilChanged()
  );
  lines = this.select(this.invoiceData, s => s.lines);
  status = this.select(this.invoiceData, s => s.status);
  paymentOptions = this.select(this.invoiceData, s => s.paymentOptions);

  invoiceCurrencySymbol = this.select(this.currency, toCurrencySymbol).pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  pendingRequests = new BehaviorSubject(0);

  selectedCustomer = signal<Customer | null>(null);

  refreshData = this.effect<void>(t$ =>
    t$.pipe(
      withLatestFrom(this.invoiceId),
      tap(([_, invoiceId]) => {
        if (!invoiceId) {
          this.#loadingFailed('Invalid invoice id');
          return;
        }

        this.#loadInvoiceData({ invoiceId, showLoader: false });
      })
    )
  );

  updateTitle = this.effect<string | null>(t$ =>
    t$.pipe(
      tap(title => this.#updateInvoiceState({ title })),
      tap(title => this.#createRequest(id => this.#api.updateTitle(id, title)))
    )
  );

  updateNotes = this.effect<string | null>(t$ =>
    t$.pipe(
      tap(notes => this.#updateInvoiceState({ notes })),
      tap(notes => this.#createRequest(id => this.#api.updateNotes(id, notes)))
    )
  );

  updateNo = this.effect<string | null>(t$ =>
    t$.pipe(
      tap(no => this.#updateInvoiceState({ no })),
      tap(no => this.#createRequest(id => this.#api.updateNo(id, no)))
    )
  );

  updatePaymentDetails = this.effect<string | null>(t$ =>
    t$
      .pipe
      //tap(paymentDetails => this.#updateInvoiceState({ paymentDetails })),
      //tap(paymentDetails => this.#createRequest(id => this.#api.updatePaymentOptions(id, paymentDetails)))
      ()
  );

  updateProject = this.effect<string | null>(t$ =>
    t$.pipe(
      tap(project => this.#updateInvoiceState({ project })),
      tap(project =>
        this.#createRequest(id => this.#api.updateProject(id, project))
      )
    )
  );

  updateCurrency = this.effect<Currency>(t$ =>
    t$.pipe(
      tap(currency => this.#updateInvoiceState({ currency })),
      tap(currency =>
        this.#createRequest(id => this.#api.updateCurrency(id, currency))
      )
    )
  );

  updateBilledTo = this.effect<string | null>(t$ =>
    t$.pipe(
      tap(billedTo => this.#updateInvoiceState({ billedTo })),
      tap(billedTo =>
        this.#createRequest(id => this.#api.updateBilledTo(id, billedTo))
      )
    )
  );

  updateDate = this.effect<Date | null>(t$ =>
    t$.pipe(
      tap(date => this.#updateInvoiceState({ date })),
      tap(date => this.#createRequest(id => this.#api.updateDate(id, date)))
    )
  );

  updateDueDate = this.effect<Date | null>(t$ =>
    t$.pipe(
      tap(dueDate => this.#updateInvoiceState({ dueDate })),
      tap(dueDate =>
        this.#createRequest(id => this.#api.updateDueDate(id, dueDate))
      )
    )
  );

  updateLines = this.effect<InvoiceLine[]>(t$ =>
    t$.pipe(
      tap(lines => this.#updateInvoiceState({ lines })),
      tap(lines => this.#createRequest(id => this.#api.updateLines(id, lines)))
    )
  );

  updateDiscount = this.effect<InvoiceDiscount | null>(t$ =>
    t$.pipe(
      tap(discount => this.#updateInvoiceState({ discount })),
      tap(discount =>
        this.#createRequest(id => this.#api.updateDiscount(id, discount))
      )
    )
  );

  updateTax = this.effect<InvoiceTax | null>(t$ =>
    t$.pipe(
      tap(tax => this.#updateInvoiceState({ tax })),
      tap(tax => this.#createRequest(id => this.#api.updateTax(id, tax)))
    )
  );

  setDraftStatus = this.effect<void>(t$ =>
    t$.pipe(
      tap(() => this.#updateInvoiceState({ status: { type: 'draft' } })),
      tap(() => this.#createRequest(id => this.#api.setDraftStatus(id)))
    )
  );

  setSentStatus = this.effect<Date>(t$ => {
    return t$.pipe(
      tap(sentOn => this.#updateInvoiceState({ status: { type: 'sent', sentOn } })),
      tap(sentOn => this.#createRequest(id => this.#api.setSentStatus(id, sentOn)))
    );
  });

  setPaidStatus = this.effect<Date>(t$ => {
    return t$.pipe(
      tap(paidOn => this.#updateInvoiceState({ status: { type: 'paid', paidOn } })),
      tap(paidOn => this.#createRequest(id => this.#api.setPaidStatus(id, paidOn)))
    );
  }
  );

  setOverdueStatus = this.effect<void>(t$ =>
    t$.pipe(
      tap(() => this.#updateInvoiceState({ status: { type: 'overdue' } })),
      tap(() => this.#createRequest(id => this.#api.setOverdueStatus(id)))
    )
  );

  togglePaymentOption = this.effect<InovicePaymentOptionType>(t$ =>
    t$.pipe(
      withLatestFrom(this.paymentOptions),
      map(([paymentOptionType, paymentOptions]) => {
        const updatedPaymentOptions = paymentOptions.map(po =>
          po.type === paymentOptionType ? { ...po, enabled: !po.enabled } : po
        );
        return updatedPaymentOptions;
      }),
      tap(paymentOptions => this.#updateInvoiceState({ paymentOptions })),
      tap(paymentOptions =>
        this.#createRequest(id =>
          this.#api.updatePaymentOptions(id, paymentOptions)
        )
      )
    )
  );

  // updateStripePaymentOption = this.effect<{enabled: boolean}>(t$ => t$.pipe(
  //   withLatestFrom(this.paymentOptions),
  //   map(([{enabled}, paymentOptions]) => {
  //     return paymentOptions
  //       .map(po => po.type === 'stripe' ? { ...po, enabled } : po);
  //   }),
  //   tap(paymentOptions => this.#updateInvoiceState({ paymentOptions })),
  //   tap(paymentOptions => this.#createRequest(id => this.#api.updatePaymentOptions(id, paymentOptions)))
  // ));

  updatePaymentOption = this.effect<InvoicePaymentOption>(t$ =>
    t$.pipe(
      withLatestFrom(this.paymentOptions),
      map(([paymentOption, paymentOptions]) => {
        return paymentOptions.map(po =>
          po.type === paymentOption.type ? paymentOption : po
        );
      }),
      tap(paymentOptions => this.#updateInvoiceState({ paymentOptions })),
      tap(paymentOptions =>
        this.#createRequest(id =>
          this.#api.updatePaymentOptions(id, paymentOptions)
        )
      )
    )
  );

  // updateTransferDetails = this.effect<string>(t$ => t$.pipe(
  //   withLatestFrom(this.paymentOptions),
  //   map(([details, paymentOptions]) => {
  //     const updatedPaymentOptions = paymentOptions
  //       .map(po => po.type === 'transfer' ? { ...po, details } : po);
  //     return updatedPaymentOptions;
  //   }),
  //   tap(paymentOptions => this.#updateInvoiceState({ paymentOptions })),
  //   tap(paymentOptions => this.#createRequest(id => this.#api.updatePaymentOptions(id, paymentOptions)))
  // ));

  #loadInvoiceData = this.effect<{ invoiceId: string; showLoader: boolean }>(
    t$ =>
      t$.pipe(
        tap(({ showLoader }) => {
          if (showLoader) {
            this.#loadingStarted();
          }
        }),
        switchMap(({ invoiceId }) => {
          return this.#api.getInvoice(invoiceId).pipe(
            // NOTE: in case of paid invoice we load shared invoice data
            // to avoid blinking we give some timeout before showing result
            tapResponse(
              data => {
                this.#setInvoiceData(data);
                setTimeout(() => this.#loadingCompleted(), 200);
              },
              () => {
                this.#loadingFailed('Failed to load invoice');
                setTimeout(() => this.#loadingCompleted(), 200);
              }
            )
          );
        })
      )
  );

  #loadingStarted = this.updater<void>((s: InvoiceEditorState) => ({
    error: null,
    invoice: null,
    loadingState: 'loading'
  }));

  #loadingFailed = this.updater((s: InvoiceEditorState, error: string) => ({
    ...s,
    error,
    invoice: null,
    loadingState: 'failed'
  }));

  #setInvoiceData = this.updater((s: InvoiceEditorState, data: Invoice) => ({
    ...s,
    invoice: data
  }));

  #loadingCompleted = this.updater((s: InvoiceEditorState) => ({
    ...s,
    loadingState: 'loaded'
  }));

  #updateInvoiceState = this.updater((s, data: Partial<InvoiceData>) => {
    let invoice = s.invoice ? { ...s.invoice, ...data } : <InvoiceData>data;
    return { ...s, invoice };
  });

  #createRequest = rxMethod<ApiRequestFactory>(
    pipe(
      withLatestFrom(this.invoiceId),
      map(
        ([rf, invId]) =>
          () =>
            rf(invId)
      ),
      tap(apiRequest => this.#backgroundRequests.schedule(apiRequest))
    )
  );

  #setupDataLoad() {
    this.invoiceId
      .pipe(untilDestroyed(this))
      .subscribe(invoiceId =>
        this.#loadInvoiceData({ invoiceId, showLoader: true })
      );
  }

  #setupSelectedCustomer() {
    // TODO: refactor

    const customerId = toSignal(this.billedTo, { initialValue: null });

    const loadCustomerDetails = rxMethod<string>(pipe(switchMap(id =>
      this.#customersApi.getCustomer(id).pipe(tapResponse(
        customer => this.selectedCustomer.set(customer),
        constVoid
      )))));

    effect(
      () => {
        const cId = customerId();

        if (!cId) {
          this.selectedCustomer.set(null);
        } else {
          loadCustomerDetails(cId);
        }
      },
      { allowSignalWrites: true }
    );
  }
}
