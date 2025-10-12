import { environment } from "../environments/environment";

export function redirectToOnigiriInvoices() {
  window.location.href = `${environment.onigiriApp}/invoices`;
}

export function openOnigiriSignUp() {
  window.open(`${environment.onigiriApp}/signup`, '_blank')?.focus();
}

export function redirectToOnigiriPageEditor() {
  window.location.href = `${environment.onigiriApp}/page`;
}