import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { BusinessesApiService } from "@onigiri-api";
import { BusinessDetails, BusinessEntity, BusinessEntityData, BusinessEntityProperty, BusinessEntityPropertyKey } from "@onigiri-models";
import { constVoid } from "fp-ts/function";
import { concatMap, exhaustMap, pipe, retry } from "rxjs";
import { AccountStore } from "./account.store";

// export interface BusinessInfoState {
//   id: string;
//   companyName: string | null;
//   contactName: string | null;
//   email: string | null;
//   phone: string | null;
//   logo: string | null;
//   address: string | null;
//   city: string | null;
//   country: string | null;
//   state: string | null;
//   postalCode: string | null;
//   vatNumber: string | null;
//   paymentDefaults: string | null;
// }

const initialState: BusinessEntity = {
  entityId: '',
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
      exhaustMap(() => api.getDefaultBusinessEntity().pipe(
        retry({ count: 3, delay: 1000 }),
        tapResponse(
          response => patchState(store, response),
          constVoid
        )))
    )),

    dataChanged(data: BusinessEntityData) {
      patchState(store, s => {
        return {...s, ...data};
      })
    },

   
    // updateProperty: rxMethod<BusinessEntityProperty>(pipe(concatMap(props => {
    //   const entityId = store.entityId();
    //   return api.updateBusinessEntity(entityId, [props]).pipe(
    //     tapResponse(
    //       () => {
    //         patchState(store, s => ({...s, [props.key]: props.value}))
    //       },
    //       constVoid
    //     )
    //   )
    // }))),
     

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