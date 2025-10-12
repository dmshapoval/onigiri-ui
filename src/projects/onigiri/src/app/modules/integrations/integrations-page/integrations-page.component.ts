import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OnigiriButtonComponent, ComingSoonChipComponent } from '@oni-shared';

interface IntegrationInfo {
  name: string;
  iconPath: string;
  iconBG: string;
  pricingDetails: string;
}

@Component({
  selector: 'app-integrations-page',
  standalone: true,
  templateUrl: './integrations-page.component.html',
  styleUrls: ['./integrations-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ComingSoonChipComponent,
    OnigiriButtonComponent
  ]
})
export class IntegrationsPageComponent {

  integrations: IntegrationInfo[] = [{
    name: 'QuickBooks',
    pricingDetails: 'Connect Stripe and accept Cards, Google & Apple Pay. Only 1% + Stripe',
    iconBG: '#2CA01C',
    iconPath: '/assets/qb_logo.png'
  }, {
    name: 'Freeagent',
    pricingDetails: 'Connect Stripe and accept Cards, Google & Apple Pay. Only 1% + Stripe',
    iconBG: '#2CA01C',
    iconPath: '/assets/qb_logo.png'
  }, {
    name: 'Xero',
    pricingDetails: 'Connect Stripe and accept Cards, Google & Apple Pay. Only 1% + Stripe',
    iconBG: '#2CA01C',
    iconPath: '/assets/qb_logo.png'
  }]

}
