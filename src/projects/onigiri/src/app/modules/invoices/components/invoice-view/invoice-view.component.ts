import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import {
  SharedInvoiceLinkData,
  SharedInvoiceLinkItem,
  toCurrencySymbol
} from '@onigiri-models';
import { OnigiriDatePipe } from '../../../../shared/pipes/date';
import { OnigiriMoneyPipe } from '../../../../shared/pipes/money';
import { OnigiriImageUrlPipe, isNotNil } from '@oni-shared';
import { AddressComponent } from '../address.component';
import { TransferInvoicePaymentOptionDto } from '../../../../api-v2/contracts/invoices';

@Component({
  selector: 'invoice-view',
  standalone: true,
  imports: [
    OnigiriMoneyPipe,
    OnigiriDatePipe,
    AddressComponent,
    OnigiriImageUrlPipe
  ],
  templateUrl: './invoice-view.component.html',
  styleUrls: ['./invoice-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceViewComponent {
  data = input.required<SharedInvoiceLinkData>();

  notes = computed(() => this.getSplittedByLines(this.data().notes));
  showDiscount = computed(() => isNotNil(this.data().discount));
  showTax = computed(() => isNotNil(this.data().tax));
  showNumbers = computed(() => this.showDiscount() || this.showTax());
  currencySymbol = computed(() => toCurrencySymbol(this.data().currency));
  senderEmail = computed(() => this.data().billed_from?.email || null);
  billedFrom = computed(() => this.data().billed_from);
  billedTo = computed(() => this.data().billed_to);

  transferDetails = computed(() => {
    const { payment_options } = this.data();
    const transferDetails = payment_options.find(
      x => x.type === 'transfer' && x.enabled
    ) as TransferInvoicePaymentOptionDto | undefined;

    return transferDetails?.data.details || '';
  });

  paymentDetails = computed(() => {
    return this.getSplittedByLines(this.transferDetails());
  });

  getLineTotal(x: SharedInvoiceLinkItem) {
    return x.qty && x.rate ? x.qty * x.rate : 0;
  }

  getSplittedByLines(v: string | null): string[] {
    return v?.split('\n').map(x => x.trim()) || [];
  }
}
