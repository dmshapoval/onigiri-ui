import { inject } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';

import { from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';

import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../config';

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const authHttpRequestInterceptor: HttpInterceptorFn =
  (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

    const auth = inject(Auth);
    const urls = inject(APP_CONFIG).urls;

    const isApiRequest = req.url.startsWith(urls.onigiri) || req.url.startsWith(urls.oneePages);

    if (!isApiRequest) {
      return next(req);
    }

    // console.log(`Req ${req.url}, hasUser ${isNotNil(auth.currentUser)} `);


    if (!auth.currentUser) {
      return next(req);
    }

    return from(auth.currentUser.getIdToken()).pipe(
      switchMap(jwt => {
        return next(req.clone({
          setHeaders: {
            Authorization: `Bearer ${jwt}`,
            'Authorization-Scheme': 'AdminApp',
            'X-USER-TIMEZONE': userTimeZone,
          }
        }))
      })
    )
  }
