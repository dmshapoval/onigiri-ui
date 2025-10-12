import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AccountApiService } from '@onigiri-api';
import { OnigiriSubscription } from '@onigiri-models';
import { AccountStore } from '@onigiri-store';
import { catchError, map, of, retry } from 'rxjs';


export const isActiveSubscriptionGuard: CanActivateChildFn | CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const router = inject(Router);
  const api = inject(AccountApiService);
  const account = inject(AccountStore);
  const auth = inject(Auth);


  const navigateToUpgrade = () => router.parseUrl('upgrade-subscription?fromGuard=true');

  const signOutAndNavigateToSignup = () => {
    auth.signOut();
    return router.parseUrl('signup');
  }


  if (account.isAuthenticated()) {
    return userSubscriptionIsExpired(account.subscription())
      ? navigateToUpgrade()
      : true;
  }

  return api.getUserInfo().pipe(
    retry({ count: 3, delay: 1000 }),
    map(r => {

      account.userAuthenticated(r);

      return userSubscriptionIsExpired(r.subscription)
        ? navigateToUpgrade()
        : true;
    }),
    catchError(() => {
      console.error('Failed to check account info');
      return of(signOutAndNavigateToSignup())
    })
  );
}


export function userSubscriptionIsExpired(s: OnigiriSubscription) {
  const now = new Date();
  return s.expiresAt <= now;
}

interface Options {
  validateExpiration: boolean
}

export function userIsAuthorizedGuard({ validateExpiration }: Options): CanActivateChildFn | CanActivateFn {

  return (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const router = inject(Router);
    const api = inject(AccountApiService);
    const auth = inject(Auth);
    const account = inject(AccountStore);

    const navigateToUpgrade = () => router.parseUrl('upgrade-subscription?fromGuard=true');
    const signOutAndNavigateToSignup = () => {
      auth.signOut();
      return router.parseUrl('signup');
    }

    if (account.isAuthenticated()) {

      return validateExpiration
        ? userSubscriptionIsExpired(account.subscription()) ? navigateToUpgrade() : true
        : true;
    }

    return api.getUserInfo().pipe(
      retry({ count: 3, delay: 1000 }),
      map(r => {

        account.userAuthenticated(r);

        return validateExpiration
          ? userSubscriptionIsExpired(r.subscription) ? navigateToUpgrade() : true
          : true;
      }),
      catchError(() => {
        console.error('Failed to check account info');
        return of(signOutAndNavigateToSignup())
      })
    );
  }
}