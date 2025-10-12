import { Component, signal } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { RequestStatus } from '@onigiri-models';
import { SharedInvoiceComponent } from './shared-invoice/shared-invoice.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { OnigiriRefFooterComponent } from '@onigiri-shared/components/onigiri-ref-footer.component';


@UntilDestroy()
@Component({
  selector: 'shared-link-page',
  standalone: true,
  templateUrl: './shared-link-page.component.html',
  styleUrls: ['./shared-link-page.component.scss'],
  imports: [
    ProgressBarModule,
    SharedInvoiceComponent,
    OnigiriRefFooterComponent
  ]
})
export class SharedLinkPageComponent {

  isLoading = signal(false);

  hadleRequestStatusChange(status: RequestStatus) {
    this.isLoading.set(status === 'running');
  }
}
