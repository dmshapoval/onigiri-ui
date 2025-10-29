import { Component, signal, Input } from '@angular/core';
import { Invoice } from '@onigiri-models';

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [],
  templateUrl: './invoice-page.component.html',
  styleUrl: './invoice-page.component.scss'
})
export class InvoicePageComponent {
  @Input() showActions = false;
  selectedInvoice = signal<Invoice | null>(null);
}
