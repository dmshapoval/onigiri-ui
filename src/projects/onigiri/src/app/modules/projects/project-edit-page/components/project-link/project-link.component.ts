import { ChangeDetectionStrategy, Component, Input, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { OnigiriIconComponent, SafeResourceUrlPipe } from '@oni-shared';
import { CustomUrlProjectLink, DATE_FORMAT, InvoiceProjectLink, ProjectLink } from '@onigiri-models';
import { InvoicesStore } from '@onigiri-store';
import { format } from 'date-fns';

@Component({
  selector: 'project-link',
  standalone: true,
  templateUrl: './project-link.component.html',
  styleUrls: ['./project-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    SafeResourceUrlPipe
  ]
})
export class ProjectLinkComponent implements OnInit {

  // @Input() projectId: string;
  // @Input() data: ProjectLink;

  #invoices = inject(InvoicesStore);
  #router = inject(Router);

  projectId = input.required<string>();
  data = input.required<ProjectLink>();


  customUrlLink = signal<CustomUrlProjectLink | null>(null);
  invoiceLink = signal<InvoiceProjectLink | null>(null);

  // #store = inject(Store<AppState>);

  invoice = computed(() => {
    const linkData = this.data();
    const invoices = this.#invoices.invoices();

    return linkData.type === 'invoice'
      ? invoices.find(x => x.id === linkData.invoiceId)
      : null;
  })


  invoiceTitle = computed(() => {
    const invoice = this.invoice();

    if (!invoice) { return null; }

    return invoice.title;
  });

  invoiceDescription = computed(() => {
    const invoice = this.invoice();

    if (!invoice) { return null; }

    const issuedAt = invoice.date ? format(invoice.date, DATE_FORMAT) : '';
    const suffix = issuedAt ? ` • Issued ${issuedAt}` : '';
    return 'Invoice' + suffix;
  });


  ngOnInit() { }

  openInvoice(invoiceId: string) {

    // TODO: verify
    this.#router.navigate(['./invoices', invoiceId], {
      queryParams: { rtn_to: `/projects/${this.projectId}` }
    });

    // this.#store.dispatch(navigateTo({
    //   route: `./invoices/${invoiceId}`,
    //   params: { rtn_to: `/projects/${this.projectId}` }
    // }));
  }

  openCustomUrl(data: CustomUrlProjectLink) {
    window.open(data.url, '_blank')?.focus();
  }

  // toInvoiceDescription(data: InvoiceProjectLink) {
  //   const issuedAt = data.date ? format(data.date, DATE_FORMAT) : '';
  //   const suffix = issuedAt ? ` • Issued ${issuedAt}` : '';
  //   return 'Invoice' + suffix;
  // }
}