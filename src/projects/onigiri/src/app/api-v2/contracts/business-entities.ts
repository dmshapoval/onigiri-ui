import { BusinessDetails, BusinessEntity, BusinessEntityPropertyKey } from "@onigiri-models";
import { AppImageDto } from "./common";
import { match } from "ts-pattern";

export interface BusinessEntityDto {
    entity_id: string;
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
    payment_defaults: string | null;
}

export type BusinessEntityPropertyDto =
    | { $type: 'company_name'; value: string | null }
    | { $type: 'contact_name'; value: string | null }
    | { $type: 'address'; value: string | null }
    | { $type: 'email'; value: string | null }
    | { $type: 'phone'; value: string | null }
    | { $type: 'city'; value: string | null }
    | { $type: 'country'; value: string | null }
    | { $type: 'state'; value: string | null }
    | { $type: 'postal_code'; value: string | null }
    | { $type: 'vat_number'; value: string | null }
    | { $type: 'payment_defaults'; value: string | null }
    | { $type: 'logo'; value: string | null }


export function toBusinessEntity(dto: BusinessEntityDto): BusinessEntity {
    return {
        entityId: dto.entity_id,
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
        vatNumber: dto.vat_number,
        paymentDefaults: dto.payment_defaults
    };
}



export function toBusinessEntityPropertyDto(
    property: BusinessEntityPropertyKey,
    value: BusinessEntity[BusinessEntityPropertyKey]): BusinessEntityPropertyDto {

    return match(property)
        .with('companyName', _ => ({ $type: 'company_name' as const, value }))
        .with('contactName', () => ({ $type: 'contact_name' as const, value }))
        .with('address', () => ({ $type: 'address' as const, value }))
        .with('email', () => ({ $type: 'email' as const, value }))
        .with('phone', () => ({ $type: 'phone' as const, value }))
        .with('city', () => ({ $type: 'city' as const, value }))
        .with('country', () => ({ $type: 'country' as const, value }))
        .with('state', () => ({ $type: 'state' as const, value }))
        .with('postalCode', () => ({ $type: 'postal_code' as const, value }))
        .with('vatNumber', () => ({ $type: 'vat_number' as const, value }))
        .with('paymentDefaults', () => ({ $type: 'payment_defaults' as const, value }))
        .with('logo', () => ({ $type: 'logo' as const, value }))
        .exhaustive();

}

// export function toBusinessEntityPropertyDto(prop: BusinessEntityProperty): BusinessEntityPropertyDto {

//     return match(prop)
//         .with({ key: 'companyName' }, ({ value }) => ({ $type: 'company_name' as const, value }))
//         .with({ key: 'contactName' }, ({ value }) => ({ $type: 'contact_name' as const, value }))
//         .with({ key: 'address' }, ({ value }) => ({ $type: 'address' as const, value }))
//         .with({ key: 'email' }, ({ value }) => ({ $type: 'email' as const, value }))
//         .with({ key: 'phone' }, ({ value }) => ({ $type: 'phone' as const, value }))
//         .with({ key: 'city' }, ({ value }) => ({ $type: 'city' as const, value }))
//         .with({ key: 'country' }, ({ value }) => ({ $type: 'country' as const, value }))
//         .with({ key: 'state' }, ({ value }) => ({ $type: 'state' as const, value }))
//         .with({ key: 'postalCode' }, ({ value }) => ({ $type: 'postal_code' as const, value }))
//         .with({ key: 'vatNumber' }, ({ value }) => ({ $type: 'vat_number' as const, value }))
//         .with({ key: 'paymentDefaults' }, ({ value }) => ({ $type: 'payment_defaults' as const, value }))
//         .with({ key: 'logo' }, ({ value }) => ({ $type: 'logo' as const, value }))
//         .exhaustive();

// }


//       email: data.email,
//       phone: data.phone,
//       address: data.address,
//       city: data.city,
//       state: data.state,
//       country: data.country,
//       postal_code: data.postalCode,
//       vat_number: data.vatNumber
//     };
//   }
