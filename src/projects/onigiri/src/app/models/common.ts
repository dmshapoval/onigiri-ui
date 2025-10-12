
export type Currency =
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  | 'CNY' | 'INR' | 'MYR' | 'KRW' | 'SGD'
  | 'TWD' | 'TRY' | 'BGN' | 'CZK' | 'DKK'
  | 'ISK' | 'MDL' | 'NOK' | 'PLN' | 'RON'
  | 'RSD' | 'SEK' | 'CHF' | 'UAH' | 'ARS'
  | 'CLP' | 'MXN' | 'BRL'
  ;

export type RequestStatus = 'not_started' | 'running' | 'completed' | 'failed';

export type PercentOrFixedNumber =
  | { type: 'fixed', value: number }
  | { type: 'percent', value: number }

export type NumberType = PercentOrFixedNumber['type'];

export type Email = string;

export interface MoneyAmount {
  currency: Currency;
  amount: number;
}

export type Period =
  | 'this_week' | 'this_month' | 'last_month'
  | 'last_3_months' | 'this_year' | 'last_year'
  | 'all_time';

export type IconKey =
  | 'dashboard' | 'projects' | 'invoices' | 'contracts'
  | 'services' | 'customers' | 'settings' | 'notifications'
  | 'logout' | 'trash' | 'arrow-back' | 'arrow-down'
  | 'arrow-forward' | 'plus' | 'plus-rounded' | 'drag'
  | 'close' | 'solid-close' | 'close-rounded'
  | 'edit' | 'calendar' | 'eye' | 'eye-off' | 'download' | 'send'
  | 'link' | 'check' | 'solid-check' | 'bank' | 'replace' | 'sparkle'
  | 'upload' | 'puzzle' | 'dollar' | 'percent' | 'phone' | 'laptop'
  | 'more' | 'restore' | 'proposal' | 'contract' | 'title'
  | 'settings_2' | 'image' | 'text_note' | 'page' | 'circle'
  | 'sm_square_tile' | 'md_vertical_tile' | 'md_horizontal_tile'
  | 'lg_square_tile' | 'sm_horizontal_tile' | 'add_text'
  | 'form' | 'sync_img'
  ;

const CURRECY_TO_SYMBOL: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  AUD: 'A$',
  CNY: '¥',
  INR: '₹',
  MYR: 'RM',
  KRW: '₩',
  SGD: '$',
  TWD: '$',
  TRY: '₺',
  BGN: 'лв.',
  CZK: 'Kč',
  DKK: 'kr.',
  ISK: 'kr.',
  MDL: 'L',
  NOK: 'kr.',
  PLN: 'zł.',
  RON: 'lei',
  RSD: 'DIN',
  SEK: 'kr.',
  CHF: 'CHF',
  UAH: '₴',
  ARS: '$',
  CLP: '$',
  MXN: '$',
  BRL: 'R$'
}

export function toCurrencySymbol(value: Currency | null | undefined): any {
  if (!value) { return ''; }

  return CURRECY_TO_SYMBOL[value];
}