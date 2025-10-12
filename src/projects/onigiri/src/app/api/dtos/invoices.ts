import {
  Invoice,
  InvoiceData,
  Currency,
  InvoiceItem,
  InvoiceLine,
  InvoiceInfo,
  InvoiceTax,
  InvoiceDiscount,
  PercentOrFixedNumber,
  InvoiceStatus,
  InvoicePaymentOption,
} from '@onigiri-models';
import { toLocalDate, toLocalDateDto } from './date-time';
import { UnexpectedValueError, exhaustiveCheck } from '@oni-shared';



export interface InvoiceDto {
  id: string;
  title: string | null;
  status: InvoiceStatus;
  no: string | null;
  notes: string | null;
  currency: Currency;
  tax: InvoiceTaxDto | null;
  discount: InvoiceDiscountDto | null;
  date: string | null;
  due_date: string | null;
  billed_to: string | null;
  project: string | null;
  lines: InvoiceLineDto[];
  payment_options: InvoicePaymentOptionDto[]
}

export interface StripeInvoicePaymentOptionDto {
  type: 'stripe';
  enabled: boolean;
}

export interface TransferInvoicePaymentOptionDto {
  type: 'transfer';
  enabled: boolean;
  data: {
    details: string | null;
  }
}

export type InvoicePaymentOptionDto = StripeInvoicePaymentOptionDto | TransferInvoicePaymentOptionDto;

export interface InvoiceDraftDataDto {
  customer: string | null;
  project: string | null;
}

export interface InvoiceInfoDto {
  id: string;
  title: string | null;
  no: string | null;
  currency: Currency;
  amount: number;
  status: InvoiceStatus;
  date: string | null;
  due_date: string | null;
  customer: string | null;
}

export type PercentOrFixedNumberDto =
  | { type: 'fixed'; value: number }
  | { type: 'percent'; value: number };

export interface InvoiceTaxDto {
  text: string | null;
  value: PercentOrFixedNumberDto;
}
export interface InvoiceDiscountDto {
  text: string | null;
  value: PercentOrFixedNumberDto;
}

export interface InvoiceLineDto {
  item: InvoiceItemDto | null;
  qty: number | null;
  rate: number | null;
  details: string | null;
}

export interface CustomServiceInvoiceItemDto {
  type: 'custom';
  custom_service: string;
}

export interface PredefinedServiceInvoiceItemDto {
  type: 'predefined';
  service_id: string;
}

export type InvoiceItemDto =
  | CustomServiceInvoiceItemDto
  | PredefinedServiceInvoiceItemDto;

export interface InvoicePDFRequestResultDto {
  url: string;
}

export interface SendInvoiceRequestDto {
  recipients: string[];
  cc: string[];
  message: string | null;
}


export function toInvoice(dto: InvoiceDto): Invoice {
  return {
    id: dto.id,
    title: dto.title,
    no: dto.no,
    status: dto.status,
    notes: dto.notes,
    billedTo: dto.billed_to,
    project: dto.project,
    currency: dto.currency,
    tax: dto.tax ? toInvoiceTax(dto.tax) : null,
    discount: dto.discount ? toInvoiceDiscount(dto.discount) : null,
    date: dto.date ? toLocalDate(dto.date) : null,
    dueDate: dto.due_date ? toLocalDate(dto.due_date) : null,
    lines: dto.lines.map(toInvoiceLine),
    paymentOptions: dto.payment_options.map(toInvoicePaymentOption)
  };
}

export function toInvoiceInfo(dto: InvoiceInfoDto): InvoiceInfo {
  return {
    id: dto.id,
    title: dto.title,
    no: dto.no,
    status: dto.status,
    customerId: dto.customer,
    amount: dto.amount,
    currency: dto.currency,
    date: dto.date ? toLocalDate(dto.date) : null,
    dueDate: dto.due_date ? toLocalDate(dto.due_date) : null,
  };
}


function toInvoiceLine(dto: InvoiceLineDto): InvoiceLine {
  return {
    item: dto.item ? toInvoiceItem(dto.item) : null,
    rate: dto.rate,
    quantity: dto.qty,
    details: dto.details,
  };
}

export function toInvoiceLineDto(data: InvoiceLine): InvoiceLineDto {
  return {
    item: data.item ? toInvoiceItemDto(data.item) : null,
    rate: data.rate,
    qty: data.quantity,
    details: data.details,
  };
}

function toInvoiceItem(dto: InvoiceItemDto): InvoiceItem | null {
  switch (dto.type) {
    case 'custom': {
      return {
        type: 'custom',
        value: dto.custom_service,
      };
    }
    case 'predefined': {
      return {
        type: 'predefined',
        serviceId: dto.service_id,
      };
    }
    default: {
      exhaustiveCheck(dto);
      return null;
    }
  }
}

function toInvoiceItemDto(item: InvoiceItem): InvoiceItemDto | null {
  switch (item.type) {
    case 'custom': {
      return {
        type: 'custom',
        custom_service: item.value,
      };
    }
    case 'predefined': {
      return {
        type: 'predefined',
        service_id: item.serviceId,
      };
    }
    default: {
      exhaustiveCheck(item);
      return null;
    }
  }
}

function toPercentOrFixedNumber(
  data: PercentOrFixedNumberDto
): PercentOrFixedNumber {
  switch (data.type) {
    case 'fixed': {
      return { type: 'fixed', value: data.value };
    }
    case 'percent': {
      return { type: 'percent', value: data.value };
    }
    default: {
      exhaustiveCheck(data);
      throw new UnexpectedValueError(data);
    }
  }
}

function toPercentOrFixedNumberDto(
  data: PercentOrFixedNumber
): PercentOrFixedNumberDto {
  switch (data.type) {
    case 'fixed': {
      return { type: 'fixed', value: data.value };
    }
    case 'percent': {
      return { type: 'percent', value: data.value };
    }
    default: {
      exhaustiveCheck(data);
      throw new UnexpectedValueError(data);
    }
  }
}

function toInvoiceTax(dto: InvoiceTaxDto): InvoiceTax | null {
  return {
    text: dto.text,
    value: toPercentOrFixedNumber(dto.value),
  };
}

function toInvoicePaymentOption(dto: InvoicePaymentOptionDto): InvoicePaymentOption {
  switch (dto.type) {
    case 'stripe': {
      return {
        type: 'stripe',
        enabled: dto.enabled
      };
    }
    case 'transfer': {
      return {
        type: 'transfer',
        enabled: dto.enabled,
        details: dto.data.details
      };
    }
    default: {
      exhaustiveCheck(dto);
      throw new UnexpectedValueError(dto);
    }
  }
}

export function toInvoicePaymentOptionDto(data: InvoicePaymentOption): InvoicePaymentOptionDto {
  switch (data.type) {
    case 'stripe': {
      return {
        type: 'stripe',
        enabled: data.enabled
      };
    }
    case 'transfer': {
      return {
        type: 'transfer',
        enabled: data.enabled,
        data: {
          details: data.details
        }
      };
    }
    default: {
      exhaustiveCheck(data);
      throw new UnexpectedValueError(data);
    }
  }
}

export function toInvoiceTaxDto(data: InvoiceTax): InvoiceTaxDto | null {
  return {
    text: data.text,
    value: toPercentOrFixedNumberDto(data.value),
  };
}

function toInvoiceDiscount(dto: InvoiceDiscountDto): InvoiceDiscount | null {
  return {
    text: dto.text,
    value: toPercentOrFixedNumber(dto.value),
  };
}

export function toInvoiceDiscountDto(
  data: InvoiceDiscount
): InvoiceDiscountDto | null {
  return {
    text: data.text,
    value: toPercentOrFixedNumberDto(data.value),
  };
}
