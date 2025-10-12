
export interface AppUser {
  name: string;
  email: string;
  subscription: OnigiriSubscription;
  integrations: UserIntegrations;
}

export type AppSubscriptionKey = 'growing_business' | 'advanced' | 'free';
export type BillingInterval = 'month' | 'year';

// export interface AppSubscriptionOption {
//   key: AppSubscriptionKey;
//   disabled: boolean;
//   name: string;
//   price: {
//     monthly: number;
//     yearly: number;
//   };
//   features: {
//     title: string;
//     list: string[]
//   };
// }

// export interface SubscriptionUpgradeRequest {
//   returnUrl: string;
//   key: AppSubscriptionKey;
//   billingInterval: BillingInterval;
// }

export interface TrialUserSubscription {
  type: 'trial';
  startsAt: Date;
  expiresAt: Date;
}

export type EnterpriseSubscriptionStatus =
  | 'active' | 'canceled'
  | 'incomplete' | 'incomplete_expired'
  | 'trialing' | 'paused'
  | 'unpaid' | 'past_due';


export interface EnterpriseUserSubscription {
  type: 'enterprise';
  startsAt: Date;
  expiresAt: Date;
  status: EnterpriseSubscriptionStatus;
  price: number;
  billingInterval: BillingInterval;
}

export type OnigiriSubscription = TrialUserSubscription | EnterpriseUserSubscription;


export function userSubscriptionIsExpired(s: OnigiriSubscription) {
  const now = new Date();
  return s.expiresAt <= now;
}

export interface UserIntegrations {
  stripe: boolean;
}

export interface BusinessDetails {
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  logo: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  vatNumber: string | null;
}

