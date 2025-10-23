

export interface BusinessEntity {
  entityId: string;
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
  paymentDefaults: string | null;
}

export type BusinessEntityData = Partial<Omit<BusinessEntity, 'entityId'>>;

export type BusinessEntityPropertyKey = keyof Omit<BusinessEntity, 'entityId'>;

export type BusinessEntityProperty<K extends BusinessEntityPropertyKey = BusinessEntityPropertyKey> = {
  key: K;
  value: BusinessEntity[K];
};


//   | { type: 'companyName'; value: string | null }
//   | { type: 'contactName'; value: string | null }
//   | { type: 'email'; value: string | null }
//   | { type: 'phone'; value: string | null }
//   | { type: 'logo'; value: string | null }
//   | { type: 'address'; value: string | null }
//   | { type: 'city'; value: string | null }
//   | { type: 'country'; value: string | null }
//   | { type: 'state'; value: string | null }
//   | { type: 'postalCode'; value: string | null }
//   | { type: 'vatNumber'; value: string | null }
//   | { type: 'paymentDefaults'; value: string | null };
