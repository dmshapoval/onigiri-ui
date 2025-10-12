import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  RedirectCommand,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PagesApiService } from '@onee-page-editor';
import { HttpErrorResponse } from '@angular/common/http';
import { match } from 'ts-pattern';
import { AccountApiService } from './account-api.service';
import { Auth } from '@angular/fire/auth';

export const userHasPageGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const api = inject(AccountApiService);
  const auth = inject(Auth);
  const router = inject(Router);

  return api.getStatus().pipe(
    map(r => {
      // console.log('Guard check result', r);

      if (r.is_registered && r.has_page) return true;

      auth.signOut();
      return redirectToSignUp(router);
    }),
    catchError((e: HttpErrorResponse) => {
      const result = match(e.status)
        .with(401, () => {
          auth.signOut();
          return redirectToSignUp(router);
        })
        .with(404, () => {
          auth.signOut();
          return redirectToSignUp(router);
        })
        .otherwise(() => redirectToError(router, 'Failed to restore page'));

      return of(result);
    })
  );
};

function redirectToSignUp(router: Router) {
  return new RedirectCommand(router.parseUrl('/signup'), {
    skipLocationChange: true
  });
}

function redirectToError(router: Router, msg: string) {
  return new RedirectCommand(router.parseUrl('/error'), {
    skipLocationChange: true,
    state: {
      error: 'User does not have onee page'
    }
  });
}
