import { AppSubscriptionKey, BillingInterval } from './account';

export interface AppSubscriptionOption {
  key: AppSubscriptionKey;
  disabled: boolean;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    title: string;
    list: string[];
  };
}

export interface SubscriptionUpgradeRequest {
  returnUrl: string;
  key: AppSubscriptionKey;
  billingInterval: BillingInterval;
}

export const APP_SUBSCRIPTION_OPTIONS: AppSubscriptionOption[] = [
  {
    key: 'growing_business',
    name: 'Growing Business',
    disabled: false,
    price: {
      monthly: 6,
      yearly: 4
    },
    features: {
      title: 'All in free, plus',
      list: [
        'Invoicing',
        'Unlimited customers',
        'Project Management',
        'Client portal',
        'Proposals'
      ]
    }
  },
  {
    key: 'advanced',
    name: 'Advanced',
    disabled: true,
    price: {
      monthly: 15,
      yearly: 10
    },
    features: {
      title: 'All Growing Business, plus',
      list: [
        'Recurring Invoices',
        'Time Tracking',
        'Advanced Custom Branding',
        'Multiple Companies',
        'Reports',
        'Personalised support'
      ]
    }
  }
];
