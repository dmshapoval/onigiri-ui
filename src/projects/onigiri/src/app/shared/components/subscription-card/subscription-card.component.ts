import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AppSubscriptionOption } from '@onigiri-models';
import { OnigiriButtonComponent, ComingSoonChipComponent } from '@oni-shared';

@Component({
  selector: 'subscription-card',
  standalone: true,
  imports: [ComingSoonChipComponent, OnigiriButtonComponent],
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionCardComponent {

  @Input() product: AppSubscriptionOption;
  @Input() showYearly = false;

  @Output() selected = new EventEmitter<AppSubscriptionOption>();

  get price() {
    return this.showYearly
      ? this.product.price.yearly
      : this.product.price.monthly;
  }

  get buttonText() {
    if (this.product.key === 'free') {
      return 'Stay Free';
    }

    return 'Choose Plan';
  }

  onSelect() {
    if (this.product.disabled) { return; }
    this.selected.emit(this.product);
  }
}
