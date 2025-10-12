import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class IntegrationsApiService {

  #http = inject(HttpClient);


  createStripeConnectUrl(returnUrl: string) {
    return this.#http
      .post<{ redirect_url: string }>(`${environment.onigiriApi}/api/stripe/connected-accounts/connect`, {
        return_url: returnUrl
      })
      .pipe(map(x => x.redirect_url));
  }

  refreshStripeIntegrationState() {
    return this.#http
      .patch<void>(`${environment.onigiriApi}/api/stripe/connected-accounts/refresh`, null);
  }

  // handleCheckoutSessionCompletion(accountId: string, sessionId: string) {
  //   return this.#http
  //     .post<void>(`${environment.onigiriApi}/api/stripe/sessions/check-completion`, {
  //       account_id: accountId,
  //       session_id: sessionId
  //     });
  // }

  disconnectStripe() {
    return this.#http
      .delete<void>(`${environment.onigiriApi}/api/stripe/connected-accounts/disconnect`);
  }

}