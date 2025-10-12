import { MoneyAmount } from "./common";

export interface Service {
  id: string;
  name: string | null;
  details: string | null;
  price: number | null;
}

export type ServiceData = Omit<Service, 'id'>;