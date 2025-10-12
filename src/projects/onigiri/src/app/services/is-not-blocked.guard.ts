import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot } from '@angular/router';


export const isNotBlockedGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  return true;

  // const router = inject(Router);
  // const userIsRu = navigator.language === 'ru';

  // if (userIsRu) return router.parseUrl('blocked/ru')

  // return true;
}