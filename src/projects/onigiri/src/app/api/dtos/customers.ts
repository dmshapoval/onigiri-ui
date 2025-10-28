import { Customer, CustomerData, Currency } from '@onigiri-models';

export interface CustomerDto {
  id: string;
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
  notes: string | null;
}

export function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    companyName: dto.company_name,
    contactName: dto.contact_name,
    email: dto.email,
    phone: dto.phone,
    address: dto.address,
    city: dto.city,
    country: dto.country,
    state: dto.state,
    postalCode: dto.postal_code,
    vatNumber: dto.vat_number,
    notes: dto.notes
  };
}

type CustomerDataDto = Omit<CustomerDto, 'id'>;
export function toCustomerDataDto(data: CustomerData): CustomerDataDto {
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
    vat_number: data.vatNumber,
    notes: data.notes
  };
}
