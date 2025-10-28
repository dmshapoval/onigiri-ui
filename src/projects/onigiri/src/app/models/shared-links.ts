import { isEmpty } from "lodash";
import { Currency } from "./common";
import { InvoicePaymentOptionDto } from "../api-v2/contracts/invoices";

export interface SharedInvoiceLinkItem {
  item: string | null;
  qty: number | null;
  rate: number | null;
  details: string | null;
}

export interface SharedInvoiceLinkData {
  title: string | null;
  no: string | null;
  issue_date: string | null;
  due_date: string | null;
  currency: Currency;
  notes: string | null;
  is_paid: boolean;

  stripe_payments_enabled: boolean;
  payment_options: InvoicePaymentOptionDto[];

  billed_to: {
    company_name: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    state: string | null;
    postal_code: string | null;
    vat_number: string | null;
  };

  billed_from: {
    company_name: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    state: string | null;
    postal_code: string | null;
    vat_number: string | null;
    logo: string | null;
  } | null;

  items: SharedInvoiceLinkItem[];

  subtotal: number;
  tax: { text: string; amount: number; } | null;
  discount: { text: string; amount: number; } | null;
  total: number;

}

export function stripePaymentEnabled(data: SharedInvoiceLinkData) {
  if (!data.stripe_payments_enabled) { return false; }

  if (data.payment_options.some(x => x.type === 'stripe' && !x.enabled)) { return false; }

  if (!data.items.length ||
    data.items.some(x => !x.rate || isEmpty(x.item))) { return false; }

  return true;
}