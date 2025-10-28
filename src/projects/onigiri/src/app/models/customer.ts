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
  status?: string;
  no?: string | null;
}

export type CustomerData = Omit<Customer, 'id'>;

// export function createCustomerSelector(all: Customer[]) {
//   return function (customerId: string | null) {
//     return customerId ? all.find(x => x.id === customerId) || null : null;
//   }
// }
