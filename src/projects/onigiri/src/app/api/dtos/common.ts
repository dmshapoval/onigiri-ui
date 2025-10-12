import { Currency, MoneyAmount } from "@onigiri-models";

export interface MoneyAmountDto {
  currency: Currency;
  amount: number;
}

export function toMoneyAmount(x: MoneyAmountDto): MoneyAmount {
  return {
    amount: x.amount,
    currency: x.currency
  };
}

export function toMoneyAmountDto(x: MoneyAmount): MoneyAmountDto {
  return {
    amount: x.amount,
    currency: x.currency
  };
}