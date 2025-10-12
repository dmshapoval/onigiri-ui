import { effect, inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Service } from "@onigiri-models";
import { constVoid } from "fp-ts/es6/function";
import { exhaustMap, map, pipe, switchMap } from "rxjs";
import { ServicesApiService } from "@onigiri-api";
import { Callback } from "@oni-shared";
import { AccountStore } from "./account.store";

export interface ServicesState {
  services: Service[];
}

const initialState: ServicesState = {
  services: []
};

export const ServicesStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),


  withMethods((store, api = inject(ServicesApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    getAll: rxMethod<Callback | void>(pipe(
      map(cb => cb || constVoid),
      exhaustMap(cb => api.getAllServices().pipe(tapResponse(
        services => {
          patchState(store, { services });
          cb();
        },
        cb
      )))
    )),

    serviceCreated(payload: Service) {
      patchState(store, state => {
        const services = [payload, ...state.services];
        return { ...state, services };
      });
    },

    serviceUpdated(payload: Service) {
      patchState(store, state => {
        const services = state.services.map(c => c.id === payload.id ? payload : c);
        return { ...state, services };
      });
    },

    serviceDeleted(serviceId: string) {
      patchState(store, state => {
        const services = state.services.filter(c => c.id !== serviceId);
        return { ...state, services };
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