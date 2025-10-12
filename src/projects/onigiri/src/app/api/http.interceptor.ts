import { inject } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';

import { from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { APP_CONFIG, isNotNil } from '@oni-shared';

import { v4 as uuidv4 } from 'uuid';

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const authHttpRequestInterceptor: HttpInterceptorFn =
  (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

    const auth = inject(Auth);
    const onigiriApi = inject(APP_CONFIG).onigiriApi;
    const oneeApi = inject(APP_CONFIG).oneePagesApi;

    const isApiRequest = req.url.startsWith(onigiriApi) || req.url.startsWith(oneeApi);

    if (!isApiRequest) {
      return next(req);
    }

    // console.log(`Req ${req.url}, hasUser ${isNotNil(auth.currentUser)} `);


    if (!auth.currentUser) {
      return next(req.clone({
        setHeaders: {
          'X-USER-TIMEZONE': userTimeZone,
        }
      }));
    }

    return from(auth.currentUser.getIdToken()).pipe(
      switchMap(jwt => {
        return next(req.clone({
          setHeaders: {
            Authorization: `Bearer ${jwt}`,
            'X-USER-TIMEZONE': userTimeZone,
          }
        }))
      })
    )
  }
