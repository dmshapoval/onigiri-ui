import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Invoice, InvoiceInfo, toInvoiceInfo } from "@onigiri-models";
import { constVoid } from "fp-ts/es6/function";
import { exhaustMap, map, pipe, switchMap } from "rxjs";
import { InvoicesApiService } from "../api/invoices-api.service";
import { Callback } from "@oni-shared";
import { AccountStore } from "./account.store";

export interface InvoicesState {
  invoices: InvoiceInfo[];
}

const initialState: InvoicesState = {
  invoices: []
};

export const InvoicesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  // withComputed(({ email }) => ({


  // })),

  withMethods((store, api = inject(InvoicesApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    getAll: rxMethod<Callback | void>(pipe(
      map(cb => cb || constVoid),
      exhaustMap(cb => api.getUserInvoices().pipe(tapResponse(
        invoices => {
          patchState(store, { invoices });
          cb();
        },
        cb
      )))
    )),

    invoiceDraftCreated(invoice: Invoice) {
      patchState(store, state => {
        const invoices = [...state.invoices, toInvoiceInfo(invoice)];
        return { ...state, invoices };
      });
    },

    invoiceUpdated(invoice: Invoice) {
      patchState(store, state => {
        const invoices = state.invoices.map(x => x.id === invoice.id
          ? toInvoiceInfo(invoice)
          : x);

        return { ...state, invoices };
      });
    },

    invoiceDeleted(invoiceId: string) {
      patchState(store, state => {
        const invoices = state.invoices.filter(x => x.id !== invoiceId);
        return { ...state, invoices };
      });
    },

  })),

  withHooks({
    onInit(store) {
      const account = inject(AccountStore);

      // signout hanlder
      effect(() => {
        const isAuthenticated = account.isAuthenticated();

        if (!isAuthenticated) {
          store.onUserSignedOut();
        }
      }, { allowSignalWrites: true })

    }
  })

);