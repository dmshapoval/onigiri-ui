import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { OneePagesApiService } from '@onigiri-api';

export const hasNoPageGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const router = inject(Router);
  const accountsApi = inject(OneePagesApiService);

  return accountsApi.getOneeStatus().pipe(
    map(r => {

      return r.is_registered && r.has_page
        ? router.parseUrl('page/edit')
        : true;
    }),
    catchError(() => {
      console.warn('Failed to check whether user already has onee page')
      return of(true);
    })
  )

  // return inject(PagesApiService).getPage().pipe(
  //   map(_ => router.parseUrl('page/edit')),
  //   catchError((e: HttpErrorResponse) => {
  //     return of(true);

  //     // TODO: consider more reasonable approach as soon as smarter error page is ready

  //     // if (e.status === 404) { return true; }
  //     // return router.parseUrl('page/edit')
  //   })


  //   // map(result => isNil(result) || router.parseUrl('page/edit')),
  //   // tap(r => console.log('GUARD RESUlT', r))
  // );
}
