import { effect, inject } from "@angular/core";
import { getState, patchState, signalStore, withMethods, withHooks, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { TrackingContext } from "@onigiri-models";
import { catchError, concatMap, map, of, pipe } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AccountStore } from "./account.store";
import { constVoid } from "fp-ts/function";


interface TrackingEvent {
  key: string;
  ctx?: TrackingContext;
}

const initialState: TrackingContext = {};

export const TrackingStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store, http = inject(HttpClient)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    setTrackingSource(source: string) {
      patchState(store, state => {
        return { ...state, source }
      })
    },

    trackEvent: rxMethod<string | TrackingEvent>(pipe(
      map(ev => typeof ev === 'string' ? { key: ev } : ev),
      concatMap(({ key, ctx }) => {

        const data: AppTrackingRequestDto = {
          key,
          payload: {
            ...getState(store),
            ...(ctx || {})
          }
        };

        return of(constVoid());

        // return http
        //   .post(`${environment.onigiriApi}/api/tracking`, data)
        //   .pipe(catchError(() => of()))
      })
    ))
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

interface AppTrackingRequestDto {
  key: string;
  payload: { [key: string]: string };
}