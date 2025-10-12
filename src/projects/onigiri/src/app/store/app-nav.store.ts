import { ActivatedRoute, Data, EventType, NavigationEnd, Params, Router } from "@angular/router";
import { inject } from "@angular/core";
import { getState, patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface AppNavigationState {
  prevUrl: string | null;
  prevRoute: string | null;
  prevParams: Params | null;
  currentUrl: string | null;
  currentRoute: string | null;
  currentParams: Params | null;
  navData: Data;
}

const initialState: AppNavigationState = {
  prevUrl: null,
  prevRoute: null,
  prevParams: null,
  currentUrl: null,
  currentRoute: null,
  currentParams: null,
  navData: {}
};

export const AppNavStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((store,
    router = inject(Router),
    activatedRoute = inject(ActivatedRoute)) => ({

      updateQueryParams(newParams: Params) {
        const mergedParams: Params = {};
        const oldParams = getState(store).currentParams || {};

        Object.assign(mergedParams, oldParams, newParams);

        router.navigate(
          [],
          {
            relativeTo: activatedRoute,
            queryParams: mergedParams,
            replaceUrl: true,
            queryParamsHandling: 'replace'
          }
        );
      },

      navigateBack(defaultRoute: string) {
        const prevUrl = getState(store).prevUrl || defaultRoute;
        router.navigateByUrl(prevUrl);
      },

      _onNavigationEnd(ev: NavigationEnd) {

        patchState(store, state => {

          if (state.currentUrl === ev.urlAfterRedirects) {
            return state;
          }


          // TODO: verify if still actual
          // we ignoring signup urls as this creates infinit loop 
          // for some business cases

          if (ev.urlAfterRedirects.indexOf('signup') >= 0) {
            return state;
          }

          // console.log('Updating nav state', state, ev);

          return {
            ...state,
            prevUrl: state.currentUrl,
            prevRoute: state.currentRoute,

            currentUrl: ev.urlAfterRedirects,
            currentRoute: ev.urlAfterRedirects.split("?")[0]
          };
        })
      },

      _onActivationStart(data: { queryParams: Params, navData: Data }) {
        patchState(store, state => {

          // console.log('Updating nav data', data);

          return {
            ...state,

            prevParams: state.currentParams,
            currentParams: data.queryParams,
            navData: data.navData
          };
        })
      },

    })),

  withHooks({
    onInit(store) {
      const router = inject(Router);

      router.events.pipe(takeUntilDestroyed()).subscribe(ev => {

        if (ev.type === EventType.NavigationEnd) {
          store._onNavigationEnd(ev);
        }

        if (ev.type === EventType.ActivationStart) {
          store._onActivationStart({
            navData: ev.snapshot.data,
            queryParams: ev.snapshot.queryParams
          })
        }

        //console.log(ev);

      });
    }
  })
)