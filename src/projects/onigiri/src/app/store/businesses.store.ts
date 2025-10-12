import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { BusinessesApiService } from "@onigiri-api";
import { BusinessDetails } from "@onigiri-models";
import { constVoid } from "fp-ts/es6/function";
import { exhaustMap, pipe, retry } from "rxjs";
import { AccountStore } from "./account.store";

export interface BusinessInfoState {
  paymentDefaults: string | null;
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  logo: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  vatNumber: string | null;
}

const initialState: BusinessInfoState = {
  paymentDefaults: null,
  companyName: null,
  contactName: null,
  email: null,
  phone: null,
  logo: null,
  address: null,
  city: null,
  country: null,
  state: null,
  postalCode: null,
  vatNumber: null
};

export const BusinessInfoStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  // withComputed(({ email }) => ({


  // })),

  withMethods((store, api = inject(BusinessesApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    restoreBusinessInfo: rxMethod<void>(pipe(
      exhaustMap(() => api.getInfo().pipe(
        retry({ count: 3, delay: 1000 }),
        tapResponse(
          dto => {
            patchState(store, {
              companyName: dto.company_name,
              contactName: dto.contact_name,
              email: dto.email,
              logo: dto.logo,
              phone: dto.phone,
              address: dto.address,
              city: dto.city,
              country: dto.country,
              state: dto.state,
              postalCode: dto.postal_code,
              vatNumber: dto.vat_number,
              paymentDefaults: dto.payment_defaults
            });
          },
          constVoid
        )))
    )),

    logoUpdated(imageId: string | null) {
      patchState(store, state => {
        return { ...state, logo: imageId };
      });
    },

    paymentDefaultsUpdated(paymentDefaults: string | null) {
      patchState(store, state => {
        return { ...state, paymentDefaults };
      });
    },

    businessDetailsUpdated(data: BusinessDetails) {
      patchState(store, state => {
        return {
          ...state,
          companyName: data.companyName,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          state: data.state,
          postalCode: data.postalCode,
          vatNumber: data.vatNumber
        };
      });
    },

  })),

  withHooks({
    onInit(store) {
      const account = inject(AccountStore);

      // signout hanlder
      effect(() => {
        const isAuthenticated = account.isAuthenticated();

        if (isAuthenticated) {
          store.restoreBusinessInfo();
        } else {
          store.onUserSignedOut();
        }
      }, { allowSignalWrites: true })

    }
  })

);