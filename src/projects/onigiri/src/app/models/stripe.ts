export interface CreateStripeCheckoutSessionRequest {
  successReturnUrl: string;
  cancelReturnUrl: string;
}

export interface CreateStripeSessionResult {
  redirectUrl: string;
}

export interface InvoiceCheckoutSessionData {
  accountId: string;
  sessionId: string;
  clientSecret: string;
}