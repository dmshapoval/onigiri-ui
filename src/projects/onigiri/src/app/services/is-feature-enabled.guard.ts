import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { AppNavStore } from '../store/app-nav.store';

type Features = typeof environment.features;

export function isFeatureEnabledGuard(feature: keyof Features): CanActivateChildFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const nav = inject(AppNavStore);

    if (environment.features[feature]) {
      return true;
    }

    nav.navigateBack('./invoices')
    // store.dispatch(navigateBack({ defaultRoute: './invoices' }));
    return false;
  };
}