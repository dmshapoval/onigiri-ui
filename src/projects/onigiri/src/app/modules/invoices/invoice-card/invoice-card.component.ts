import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnigiriDatePipe } from '@onigiri-shared/pipes/date';
import { Customer } from '@onigiri-models';

@Component({
  selector: 'invoice-card',
  standalone: true,
  templateUrl: './invoice-card.component.html',
  styleUrls: ['./invoice-card.component.scss'],
  imports: [CommonModule, OnigiriDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceCardComponent {
  @Input() customer: Customer | null = null;
  @Input() date: Date | null = null;
  @Input() entry: any | null = null;
  @Input() showActions = false;
  @Output() clickMore = new EventEmitter<string>();
  ngOnInit() {
    console.log('Customer:', this.customer);
  }
  moreIcon: string = '../../../../assets/more 1.svg';
}
