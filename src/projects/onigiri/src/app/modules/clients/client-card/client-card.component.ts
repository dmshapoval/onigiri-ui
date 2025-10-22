import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Customer } from '@onigiri-models';

@Component({
  selector: 'client-card',
  standalone: true,
  templateUrl: './client-card.component.html',
  styleUrls: ['./client-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientCardComponent {
  @Input() customer!: Customer;
  @Input() showActions = false;
}

