import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  BusinessLogoUpdateDto, PaymentDefaultsUpdateDto,

  toBusinessDetailsDto,
} from './dtos/account';
import { BusinessDetails } from '@onigiri-models';
import { retry } from 'rxjs';
import { delay } from 'lodash';

@Injectable({ providedIn: 'root' })
export class BusinessesApiService {

  #http = inject(HttpClient);


  getInfo() {
    return this.#http.get<BusinessInfoDto>(`${environment.onigiriApi}/api/businesses/main`);
  }

  updateBusinessDetails(data: BusinessDetails) {
    const payload = toBusinessDetailsDto(data);
    return this.#http.put<void>(`${environment.onigiriApi}/api/businesses/main`, payload);
  }

  updateLogo(imageId: string | null) {
    const payload: BusinessLogoUpdateDto = { logo: imageId };
    return this.#http.put<void>(`${environment.onigiriApi}/api/businesses/main/logo`, payload);
  }

  updatePaymentDefaults(paymentDefaults: string | null) {
    const payload: PaymentDefaultsUpdateDto = { payment_defaults: paymentDefaults };
    return this.#http.put<void>(`${environment.onigiriApi}/api/businesses/main/payment-defaults`, payload);
  }

  // createCheckoutSession(req: SubscriptionUpgradeRequest) {
  //   const payload: CreateCheckoutSessionRequestDto = {
  //     product_key: req.key,
  //     billing_interval: req.billingInterval,
  //     success_return_url: req.returnUrl!,
  //     cancel_return_url: req.returnUrl!
  //   };

  //   return this.#http.post<CreateStripeSessionResultDto>(`${environment.onigiriApi}/api/stripe/checkout/session`, payload)
  //     .pipe(map(x => x.redirect_url))
  // }

  // createCustomerPortalSession(returnUrl: string) {
  //   const payload: CreateCustomerPortalSessionRequestDto = {
  //     return_url: returnUrl
  //   };

  //   return this.#http.post<CreateStripeSessionResultDto>(`${environment.onigiriApi}/api/stripe/billing/session`, payload)
  //     .pipe(map(x => x.redirect_url))
  // }


}

interface BusinessInfoDto {
  logo: string | null;
  payment_defaults: string | null;
  company_name: string | null;
  contact_name: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postal_code: string | null;
  vat_number: string | null;
}

interface BusinessDetailsUpdateDto {
  company_name: string | null;
  contact_name: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postal_code: string | null;
  vat_number: string | null;
}