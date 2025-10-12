
export interface OnigiriUserDto {
  id: string;
  firebase_id: string;
  email: string;
  subscription: OnigiriSubscriptionDto;
  created_at: number;
}

export type OnigiriSubscriptionDto = TrialUserSubscriptionDto | EnterpriseUserSubscriptionDto;

export interface TrialUserSubscriptionDto {
  type: 'trial';
  starts_at: number;
  expires_at: number;
}

export interface EnterpriseUserSubscriptionDto {
  type: 'enterprise';
  starts_at: number;
  expires_at: number;
  price: number;
  status: EnterpriseSubscriptionStatus;
  billing_interval: BillingInterval;
}

export type EnterpriseSubscriptionStatus =
  | 'active' | 'canceled'
  | 'incomplete' | 'incomplete_expired'
  | 'trialing' | 'paused'
  | 'unpaid' | 'past_due';

export type BillingInterval = 'month' | 'year';