import { ChangeDetectionStrategy, Component, HostBinding, OnInit, computed, input } from '@angular/core';
import { InvoiceStatus, InvoiceStatusType } from '../../../models/invoice';
import { exhaustiveCheck } from '@oni-shared';

@Component({
  selector: 'invoice-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="invoice-status-chip">{{text()}}</span>`,
  styles: [`

    :host { 
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 20px;
      border-radius: 20px;
    }

    .invoice-status-chip {
      color: var(--color-grey-1000);
      font-size: 8px;
      font-weight: 700;
    }
    
  `]
})
export class InvoiceStatusChipComponent {
  status = input.required<InvoiceStatusType>();

  @HostBinding("style.background-color")
  get bgColor() {
    const status = this.status();
    switch (status) {
      case 'draft': return 'var(--color-grey-200)';
      case 'sent': return 'var(--color-blue-200)';
      case 'paid': return 'var(--color-green-200)';
      case 'overdue': return 'var(--color-red-200)';
      default: {
        exhaustiveCheck(status);
        return 'transparent';
      }
    }
  }

  text = computed(() => {
    const status = this.status();
    switch (status) {
      case 'draft': return 'DRAFT';
      case 'sent': return 'SENT';
      case 'paid': return 'PAID';
      case 'overdue': return 'OVERDUE';
      default: {
        exhaustiveCheck(status);
        return 'UNKNOWN';
      }
    }
  });

  ;
}