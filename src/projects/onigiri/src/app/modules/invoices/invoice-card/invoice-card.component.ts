import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnigiriDatePipe } from '@onigiri-shared/pipes/date';
import { Customer, Invoice, InvoiceInfo } from '@onigiri-models';

@Component({
  selector: 'invoice-card',
  standalone: true,
  templateUrl: './invoice-card.component.html',
  styleUrls: ['./invoice-card.component.scss'],
  imports: [CommonModule, OnigiriDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceCardComponent {
  @Input() invoice: InvoiceInfo | null;
  @Input() date: Date | null;
  @Input() entry: any | null;
  @Input() showActions = false;
  @Output() clickMore = new EventEmitter<string>();
  moreIcon: string = '../../../../assets/more 1.svg';
}
