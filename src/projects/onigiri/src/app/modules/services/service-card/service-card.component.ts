import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Service } from '@onigiri-models';

@Component({
  selector: 'service-card',
  standalone: true,
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceCardComponent {
  @Input() service!: Service;
}
