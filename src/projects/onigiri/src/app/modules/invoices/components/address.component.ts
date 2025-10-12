import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'o-address',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="flex flex-column justify-content-start align-items-start">
      @if(address) { <span>{{address}}</span> }
      @if(secondLine) { <span>{{secondLine}}</span> }
      @if(country) { <span>{{country}}</span> }
    </p>
  `,
  styles: [`
    :host {
      display: inline-block
    }
  `]
})
export class AddressComponent {

  @Input() address: string | null | undefined;
  @Input() city: string | null | undefined;
  @Input() state: string | null | undefined;
  @Input() postalCode: string | null | undefined;
  @Input() country: string | null | undefined;

  get secondLine() {
    let result = '';

    if (this.city) {
      result += this.city;
    }

    if (this.state) {
      result += result ? ', ' : '';
      result += this.state;
    }

    if (this.postalCode) {
      result += result ? ', ' : '';
      result += this.postalCode;
    }

    return result;
  }

  constructor() { }

}