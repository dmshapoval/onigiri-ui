import { Service, ServiceData, ServiceListItem } from "@onigiri-models";
import { MoneyAmountDto, toMoneyAmount, toMoneyAmountDto } from "./common";

export interface ServiceDto {
  id: string;
  name: string | null;
  details: string | null;
  price: number | null;
}

export interface ServiceListItemDto {
  id: string;
  name: string | null;
  price: number | null;
}

export function toService(dto: ServiceDto): Service {
  return {
    id: dto.id,
    name: dto.name,
    details: dto.details,
    price: dto.price
  };
}

type ServiceDataDto = Omit<ServiceDto, 'id'>;
export function toServiceDataDto(data: ServiceData): ServiceDataDto {
  return {
    name: data.name,
    details: data.details,
    price: data.price
  };
}

export function toServiceListItem(dto: ServiceListItemDto): ServiceListItem {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price
  };
}