import {
  UnexpectedValueError, exhaustiveCheck
} from "@oni-shared";
import {
  BusinessDetails, AppUser, BillingInterval,
  EnterpriseSubscriptionStatus, OnigiriSubscription
} from "@onigiri-models";

import { } from "../../models";

export interface AppUserDto {
  name: string;
  email: string;
  subscription: OnigiriSubscriptionDto;
  integrations: {
    stripe: boolean;
  }
}

// export interface UserSubscriptionsDto {
//   onigiri: OnigiriSubscriptionDto | null;
// }


interface TrialUserSubscriptionDto {
  type: 'trial';
  starts_at: number;
  expires_at: number;
}

interface EnterpriseUserSubscriptionDto {
  type: 'enterprise';
  starts_at: number;
  expires_at: number;
  price: number;
  status: EnterpriseSubscriptionStatus;
  billing_interval: BillingInterval;
}

export function toAppUser(dto: AppUserDto) {
  const { subscription, integrations } = dto;

  const result: AppUser = {
    name: dto.name,
    email: dto.email,
    subscription: toOnigiriSubscription(subscription),
    integrations: {
      stripe: integrations.stripe
    }
  };

  return result;
}


function toOnigiriSubscription(dto: TrialUserSubscriptionDto | EnterpriseUserSubscriptionDto): OnigiriSubscription {
  switch (dto.type) {
    case 'trial': {
      return {
        type: 'trial',
        startsAt: new Date(dto.starts_at),
        expiresAt: new Date(dto.expires_at)
      };
    }
    case 'enterprise': {
      return {
        type: 'enterprise',
        startsAt: new Date(dto.starts_at),
        expiresAt: new Date(dto.expires_at),
        status: dto.status,
        price: dto.price || 0,
        billingInterval: dto.billing_interval
      };
    }
    default: {
      exhaustiveCheck(dto);
      throw new UnexpectedValueError(dto);
    }
  }
}

export interface SignUpResultDto {
  is_new: boolean;
  is_new_for_onigiri: boolean;
}

export interface BusinessDetailsDto {
  company_name: string | null;
  contact_name: string | null;
  logo: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postal_code: string | null;
  vat_number: string | null;
}

export interface BusinessDetailsUpdateDto {
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

export interface BusinessLogoUpdateDto {
  logo: string | null;
}

export interface PaymentDefaultsUpdateDto {
  payment_defaults: string | null;
}

interface TrialUserSubscriptionDto {
  type: 'trial';
  starts_at: number;
  expires_at: number;
}

interface EnterpriseUserSubscriptionDto {
  type: 'enterprise';
  starts_at: number;
  expires_at: number;
  price: number;
  status: EnterpriseSubscriptionStatus;
  billing_interval: BillingInterval;
}


// export function toAppUser(dto: AppUserDto): OniAppUser {
//   return {
//     name: dto.name,
//     email: dto.email,
//     paymentDefaults: dto.payment_defaults,
//     businessDetails: toBusinessDetails(dto.business_details),
//     subscriptions: toUserSubscriptions(dto.subscriptions),
//     integrations: {
//       stripe: dto.integrations.stripe
//     }
//   };
// }

function toBusinessDetails(dto: BusinessDetailsDto): BusinessDetails {
  return {
    companyName: dto.company_name,
    contactName: dto.contact_name,
    email: dto.email,
    logo: dto.logo,
    phone: dto.phone,
    address: dto.address,
    city: dto.city,
    country: dto.country,
    state: dto.state,
    postalCode: dto.postal_code,
    vatNumber: dto.vat_number
  };
}

export function toBusinessDetailsDto(data: BusinessDetails): BusinessDetailsUpdateDto {
  return {
    company_name: data.companyName,
    contact_name: data.contactName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    postal_code: data.postalCode,
    vat_number: data.vatNumber
  };
}

type OnigiriSubscriptionDto = TrialUserSubscriptionDto | EnterpriseUserSubscriptionDto;

interface TrialUserSubscriptionDto {
  type: 'trial';
  starts_at: number;
  expires_at: number;
}

interface EnterpriseUserSubscriptionDto {
  type: 'enterprise';
  starts_at: number;
  expires_at: number;
  price: number;
  status: EnterpriseSubscriptionStatus;
  billing_interval: BillingInterval;
}


// export function toUserSubscriptions(dto: UserSubscriptionsDto): UserSubscriptions {
//   return {
//     onigiri: dto.onigiri ? toOnigiriSubscription(dto.onigiri) : null,
//   };
// }

// export function toAppUser(dto: AppUserDto): AppUser {
//   return {
//     name: dto.name,
//     email: dto.email,
//     subscription: toUserSubscription(dto.subscription)
//   };
// }



// function toOnigiriSubscription(dto: TrialUserSubscriptionDto | EnterpriseUserSubscriptionDto): OnigiriSubscription {
//   switch (dto.type) {
//     case 'trial': {
//       return {
//         type: 'trial',
//         startsAt: new Date(dto.starts_at),
//         expiresAt: new Date(dto.expires_at)
//       };
//     }
//     case 'enterprise': {
//       return {
//         type: 'enterprise',
//         startsAt: new Date(dto.starts_at),
//         expiresAt: new Date(dto.expires_at),
//         status: dto.status,
//         price: dto.price || 0,
//         billingInterval: dto.billing_interval
//       };
//     }
//     default: {
//       exhaustiveCheck(dto);
//       throw new UnexpectedValueError(dto);
//     }
//   }
// }