import { inject } from "@angular/core";
import { Auth, isSignInWithEmailLink } from "@angular/fire/auth";
import { CanActivateChildFn, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";

export const isSignInCompletionGuard: CanActivateChildFn | CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const router = inject(Router);
  const auth = inject(Auth);

  return isSignInWithEmailLink(auth, window.location.href)
    ? true
    : router.parseUrl('/signup');
}