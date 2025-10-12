import { pipe } from "fp-ts/es6/function";
import { Currency, PercentOrFixedNumber } from "./common";
import * as A from 'fp-ts/es6/Array';
import sum from "lodash/sum";

export interface InvoiceInfo {
  id: string;
  title: string | null;
  status: InvoiceStatus;
  no: string | null;
  date: Date | null;
  dueDate: Date | null;
  customerId: string | null;
  currency: Currency;
  amount: number;
}

export interface Invoice {
  id: string;
  title: string | null;
  no: string | null;
  notes: string | null;
  status: InvoiceStatus;
  currency: Currency;
  tax: InvoiceTax | null;
  discount: InvoiceDiscount | null;
  date: Date | null;
  dueDate: Date | null;
  billedTo: string | null;
  project: string | null;
  lines: InvoiceLine[];
  paymentOptions: InvoicePaymentOption[];
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceTax { text: string | null, value: PercentOrFixedNumber }

export interface InvoiceDiscount { text: string | null, value: PercentOrFixedNumber }

export interface CustomServiceInvoiceItem {
  type: 'custom';
  value: string;
}

export interface PredefinedServiceInvoiceItem {
  type: 'predefined';
  serviceId: string;
}

export type InvoiceItem =
  | CustomServiceInvoiceItem
  | PredefinedServiceInvoiceItem;


export interface InvoiceLine {
  item: InvoiceItem | null;
  rate: number | null;
  quantity: number | null;
  details: string | null;
}

export type InvoiceData = Omit<Invoice, 'id'>;
export type InvoiceLineNumbers = Partial<Pick<InvoiceLine, 'quantity' | 'rate'>>;

export interface StripeInvoicePaymentOption {
  type: 'stripe';
  enabled: boolean;
}

export interface TransferInvoicePaymentOption {
  type: 'transfer';
  enabled: boolean;
  details: string | null;
}

export type InvoicePaymentOption =
  | StripeInvoicePaymentOption
  | TransferInvoicePaymentOption;

export type InovicePaymentOptionType = InvoicePaymentOption['type'];

export function toInvoiceInfo(data: Invoice): InvoiceInfo {
  const r: InvoiceInfo = {
    id: data.id,
    title: data.title,
    status: data.status,
    no: data.no,
    date: data.date,
    dueDate: data.dueDate,
    customerId: data.billedTo,
    currency: data.currency,
    amount: getInvoiceTotal(data)
  };

  return r;
}

export function getInvoiceLineTotal(invoiceLine: InvoiceLineNumbers) {
  return invoiceLine.rate && invoiceLine.quantity ? invoiceLine.rate * invoiceLine.quantity : 0;
}

export function getInvoiceSubtotal(invoiceLines: InvoiceLineNumbers[]) {
  const result = pipe(invoiceLines, A.map(getInvoiceLineTotal), sum);

  return result;
}

export function getInvoiceTotal(invoice: Partial<Invoice>) {

  const discount = getInvoiceDiscountAmount(invoice);
  const tax = getInvoiceTaxAmount(invoice);

  const result = getInvoiceSubtotal(invoice?.lines || []) - discount + tax;

  return Math.max(result, 0);
}

export function getInvoiceDiscountAmount(invoice: Partial<Invoice>) {
  const discount = invoice.discount;
  if (!discount) { return 0; }
  if (discount.value.type === 'fixed') return discount.value.value;

  const base = getInvoiceSubtotal(invoice?.lines || []);
  return base * (discount.value.value / 100);
}

export function getInvoiceTaxAmount(invoice: Partial<Invoice>) {
  const tax = invoice.tax;
  if (!tax) { return 0; }

  if (tax.value.type === 'fixed') return tax.value.value;

  const subTotal = getInvoiceSubtotal(invoice?.lines || []);
  const discount = getInvoiceDiscountAmount(invoice);
  const base = subTotal - discount;

  const result = base * (tax.value.value / 100);

  return Math.max(result, 0);
}
