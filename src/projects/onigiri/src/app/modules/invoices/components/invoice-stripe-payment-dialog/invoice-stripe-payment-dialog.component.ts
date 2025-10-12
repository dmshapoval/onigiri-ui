import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { OnigiriIconComponent } from '@oni-shared';
import { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { firstValueFrom, Observable } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { loadStripe } from '@stripe/stripe-js/pure';
import { InvoiceCheckoutSessionData } from '@onigiri-models';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent, SkeletonModule],
  selector: 'invoice-stripe-payment-dialog',
  templateUrl: 'invoice-stripe-payment-dialog.component.html',
  styleUrl: 'invoice-stripe-payment-dialog.component.scss'
})
export class InvoiceStripePaymentDialogComponent implements OnInit, AfterViewInit {

  #dialogRef = inject(DialogRef);

  #data: {
    getSession: () => Observable<InvoiceCheckoutSessionData>;
    onComplete: (sessionId: string) => void
  } = inject(DIALOG_DATA);

  @ViewChild("checkoutEl") checkoutEl: ElementRef<HTMLDivElement>;

  isLoading = signal(true);
  #checkout: StripeEmbeddedCheckout | null = null;

  error = signal<string | null>(null);

  // elements: StripeElements;

  ngOnInit() {

  }

  async ngAfterViewInit() {
    // const clientSecret = this.#data.clientSecret;
    // const stripe = this.#stripeService.instance();

    try {

      const { accountId, clientSecret, sessionId } = await firstValueFrom(this.#data.getSession());

      const stripe = await loadStripe(environment.stripePublicKey, {
        stripeAccount: accountId
      });

      if (!stripe) {
        console.error('Failed to get stripe instance');
        return;
      }


      this.#checkout = await stripe.initEmbeddedCheckout({
        clientSecret: clientSecret,
        onComplete: () => this.#onCompleted(sessionId),
      });

      this.isLoading.set(false);

      this.#checkout.mount(this.checkoutEl.nativeElement);

    } catch (error) {
      console.error('Failed to init payment', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel() {
    this.#destroyCheckout();
    this.#dialogRef.close();
  }


  #onCompleted(sessionId: string) {
    this.#data.onComplete(sessionId);
    this.#destroyCheckout();
    this.#dialogRef.close();
  }

  #destroyCheckout() {
    try {
      this.#checkout?.destroy();
    } catch (error) {
      console.error(error);
    }
  }

}

// #initCheckout = rxMethod<void>(pipe(
//   tap(_ => this.isLoading.set(true)),
//   exhaustMap(_ => this.#data.getClientSecret().pipe(
//     tapResponse(
//       clientSecret => {
//         this.isLoading.set(false);
//         this.#handleClientSecret(clientSecret);
//       },
//       e => {
//         console.error("Failed to init checkout session", e);
//       })
//   ))
// ));

// async #handleClientSecret(clientSecret: string) {
//   const stripe = this.#stripeService.instance()!;

//   try {



//   } catch (e) {
//     console.error("Failed to init checkout element", e);
//   }
// }

// async handleSubmit(e: Event) {
//   e.preventDefault();
//   this.isLoading.set(true);

//   const { error } = await this.#stripeService.instance()!.confirmPayment({
//     elements: this.elements,
//     confirmParams: {
//       return_url: window.location.href,
//     },
//   });

//   // This point will only be reached if there is an immediate error when
//   // confirming the payment. Otherwise, your customer will be redirected to
//   // your `return_url`. For some payment methods like iDEAL, your customer will
//   // be redirected to an intermediate site first to authorize the payment, then
//   // redirected to the `return_url`.
//   if (error.type === "card_error" || error.type === "validation_error") {
//     this.error.set(error.message || 'An unexpected error occurred');
//   } else {
//     this.error.set("An unexpected error occurred.");
//   }

//   this.isLoading.set(false);
// }