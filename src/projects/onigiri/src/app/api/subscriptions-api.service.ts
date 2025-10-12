import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubscriptionUpgradeRequest } from '@onigiri-models';
import { CreateCheckoutSessionRequestDto, CreateCustomerPortalSessionRequestDto, CreateStripeSessionResultDto } from './dtos/stripe';

@Injectable({ providedIn: 'root' })
export class SubscriptionsApiService {

  #http = inject(HttpClient);


  createCheckoutSession(req: SubscriptionUpgradeRequest) {
    const payload: CreateCheckoutSessionRequestDto = {
      product_key: req.key,
      billing_interval: req.billingInterval,
      success_return_url: req.returnUrl!,
      cancel_return_url: req.returnUrl!
    };

    return this.#http.post<CreateStripeSessionResultDto>(`${environment.onigiriApi}/api/stripe/sessions/checkout/subscription`, payload)
      .pipe(map(x => x.redirect_url))
  }

  createCustomerPortalSession(returnUrl: string) {
    const payload: CreateCustomerPortalSessionRequestDto = {
      return_url: returnUrl
    };

    return this.#http.post<CreateStripeSessionResultDto>(`${environment.onigiriApi}/api/stripe/sessions/billing`, payload)
      .pipe(map(x => x.redirect_url))
  }

}