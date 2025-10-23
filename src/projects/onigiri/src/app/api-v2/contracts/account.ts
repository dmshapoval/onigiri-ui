import {
  UnexpectedValueError, exhaustiveCheck
} from "@oni-shared";
import {
  BusinessDetails, AppUser, BillingInterval,
  EnterpriseSubscriptionStatus, OnigiriSubscription
} from "@onigiri-models";

import { } from "../../models";
import { match } from "ts-pattern";
import { AppImageDto } from "./common";

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
  $type: 'trial';
  starts_at: number;
  expires_at: number;
}

interface EnterpriseUserSubscriptionDto {
  $type: 'enterprise';
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
  return match(dto)
    .with({ $type: 'trial' }, d => ({
      type: 'trial' as const,
      startsAt: new Date(d.starts_at),
      expiresAt: new Date(d.expires_at)
    }))
    .with({ $type: 'enterprise' }, d => ({
      type: 'enterprise' as const,
      startsAt: new Date(d.starts_at),
      expiresAt: new Date(d.expires_at),
      status: d.status,
      price: d.price || 0,
      billingInterval: d.billing_interval
    }))
    .exhaustive();
}

export interface SignUpResultDto {
  is_new: boolean;
  is_new_for_onigiri: boolean;
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