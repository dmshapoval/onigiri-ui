import { Injectable, signal } from '@angular/core';
import { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {

  constructor() {
    loadStripe(environment.stripePublicKey)
      .then(s => this.instance.set(s))
      .catch(e => {
        console.error('Failed to instantiate Stripe instance');
      });
  }

  instance = signal<Stripe | null>(null);

}