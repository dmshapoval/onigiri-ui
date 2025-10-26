
export interface ServiceListItem {
  id: string;
  name: string | null;
  price: number | null;
}

export interface Service {
  id: string;
  name: string | null;
  details: string | null;
  price: number | null;
}

export type ServiceData = Omit<Service, 'id'>;

export function toServiceListItem(service: Service): ServiceListItem {
  return {
    id: service.id,
    name: service.name,
    price: service.price
  };
}