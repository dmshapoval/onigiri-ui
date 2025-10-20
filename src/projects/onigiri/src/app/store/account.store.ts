import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { computed, effect, inject } from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { concatMap, filter, pipe, retry, switchMap, take, takeUntil, tap, timer } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { constVoid } from "fp-ts/function";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { Auth, authState } from "@angular/fire/auth";
import { isNil } from "lodash";
import { AppUser, OnigiriSubscription, UserIntegrations } from "@onigiri-models";
import { isFalsy, isNotNil, isTruthy } from "@oni-shared";
import { AccountApiService } from "@onigiri-api";
import { addDays } from "date-fns";

export interface AccountState {
  isAuthenticated: boolean;
  email: string | null;
  name: string | null;
  integrations: UserIntegrations;
  subscription: OnigiriSubscription;
}

const initialState: AccountState = {

  isAuthenticated: false,

  email: null,
  name: null,

  integrations: {
    stripe: false
  },

  subscription: {
    type: 'trial',
    startsAt: addDays(new Date(), -1),
    expiresAt: addDays(new Date(), 7)
  }

};


export const AccountStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ }) => ({

    // isAuthenticated: computed(() => isNotNil(email())),

  })),

  withMethods((store, accountApi = inject(AccountApiService)) => ({

    onUserSignedOut() {
      patchState(store, initialState);
    },

    userAuthenticated(user: AppUser) {
      patchState(store, {
        isAuthenticated: true,
        email: user.email,
        integrations: user.integrations,
        name: user.name,
        subscription: user.subscription
      });
    },

    refreshUserInfo: rxMethod<void>(pipe(
      concatMap(() => accountApi.getUserInfo().pipe(
        retry({ count: 2, delay: 500 }),
        tapResponse(
          data => {
            patchState(store, {
              email: data.email,
              integrations: data.integrations,
              name: data.name,
              subscription: data.subscription
            });
          },
          constVoid
        )
      ))
    )),

    syncUserTimezone: rxMethod<void>(pipe(
      switchMap(() => accountApi.updateUserTimeZone().pipe(
        retry({ count: 2, delay: 1000 }),
        tapResponse(
          () => console.log('User timezone synced'),
          constVoid
        )
      ))
    )),

  })),

  withHooks({
    onInit(store) {

      const auth = inject(Auth);

      authState(auth).pipe(
        takeUntilDestroyed()
      ).subscribe(user => {

        if (!user) {
          store.onUserSignedOut();
        }

      });

      // authState(auth).pipe(
      //   filter(isNil),
      //   tap(() => store.onUserSignedOut()),
      //   takeUntilDestroyed()
      // ).subscribe();

      // // to prevent freezing
      // authState(auth).pipe(filter(isNotNil))
      //   .subscribe(() => {
      //     setTimeout(() => store.refreshUserInfo(), 3000);
      //   });

      const isAuthenticated = toObservable(store.isAuthenticated);

      // setup user info sync
      isAuthenticated.pipe(
        filter(isTruthy),
        switchMap(() => {
          //console.log('SIGNED IN')
          return timer(10_000, 30_000).pipe(
            takeUntil(isAuthenticated.pipe(filter(isFalsy), take(1))),
            tap(() => store.refreshUserInfo())
          );
        }),
        takeUntilDestroyed()
      ).subscribe();

      // sync timezone
      effect(() => {
        const isAuthenticated = store.isAuthenticated();

        if (isAuthenticated) {
          setTimeout(() => {
            store.syncUserTimezone();
          }, 10_000);
        }
      });
    }
  })

);