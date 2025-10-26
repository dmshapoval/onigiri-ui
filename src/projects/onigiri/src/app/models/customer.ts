
export interface CustomerListItem {
  id: string;
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
}

export interface Customer {
  id: string;
  contactName: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  notes: string | null;
}

export type CustomerData = Omit<Customer, 'id'>;

export function toCustomerListItem(c: Customer): CustomerListItem {
  return {
    id: c.id,
    contactName: c.contactName,
    companyName: c.companyName,
    email: c.email,
    phone: c.phone,
    city: c.city,
    country: c.country,
  };
}

// export function createCustomerSelector(all: Customer[]) {
//   return function (customerId: string | null) {
//     return customerId ? all.find(x => x.id === customerId) || null : null;
//   }
// }