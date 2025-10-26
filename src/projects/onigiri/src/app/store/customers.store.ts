import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Customer, CustomerListItem, toCustomerListItem } from "@onigiri-models";
import { constVoid } from "fp-ts/es6/function";
import { exhaustMap, firstValueFrom, map, pipe, switchMap } from "rxjs";
import { CustomersApiService } from "@onigiri-api";
import { Callback } from "@oni-shared";
import { AccountStore } from "./account.store";

export interface CustomersState {
  customers: CustomerListItem[];
}

const initialState: CustomersState = {
  customers: []
};

export const CustomersStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  // withComputed(({ email }) => ({


  // })),

  withMethods((store, api = inject(CustomersApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    // getAll: rxMethod<Callback | void>(pipe(
    //   map(cb => cb || constVoid),
    //   exhaustMap(cb => api.getAllCustomers().pipe(tapResponse(
    //     customers => {
    //       patchState(store, { customers });
    //       cb();
    //     },
    //     cb
    //   )))
    // )),

    async refreshState() {
      await firstValueFrom(api.getAllCustomers().pipe(
        tapResponse(
          customers => patchState(store, { customers }),
          constVoid
        )
      ));
    },

    customerCreated(customer: Customer) {
      patchState(store, state => {
        const customers = [toCustomerListItem(customer), ...state.customers];
        return { ...state, customers };
      });
    },

    customerUpdated(customer: Customer) {
      patchState(store, state => {
        const customers = state.customers.map(c => c.id === customer.id ? toCustomerListItem(customer) : c);
        return { ...state, customers };
      });
    },

    customerDeleted(customerId: string) {
      patchState(store, state => {
        const customers = state.customers.filter(c => c.id !== customerId);
        return { ...state, customers };
      });
    }

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