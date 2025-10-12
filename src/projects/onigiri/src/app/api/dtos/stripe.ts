import { AppSubscriptionKey, BillingInterval } from "@onigiri-models";

export interface CreateCustomerPortalSessionRequestDto {
  return_url: string;
}

export interface CreateCheckoutSessionRequestDto {
  product_key: AppSubscriptionKey;
  billing_interval: BillingInterval;
  success_return_url: string;
  cancel_return_url: string;
}

export interface CreateStripeSessionResultDto {
  redirect_url: string;
}