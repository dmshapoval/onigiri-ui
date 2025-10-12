import { InvoiceItem } from "@onigiri-models";

export interface ItemSuggestion {
  id: string;
  name: string;
  details: string | null;
}