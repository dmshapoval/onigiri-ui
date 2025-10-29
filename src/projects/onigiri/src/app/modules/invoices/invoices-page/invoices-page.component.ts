import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { pipe, exhaustMap, tap, filter, concatMap } from 'rxjs';
import { CustomersStore, InvoicesStore, TrackingStore } from '@onigiri-store';
import {
  Customer,
  InvoiceInfo,
  InvoiceStatus,
  TRACKING,
  toCurrencySymbol
} from '@onigiri-models';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import {
  OnigiriButtonComponent,
  OnigiriIconComponent,
  OnigiriTemplate,
  isTruthy
} from '@oni-shared';
import { OnigiriDatePipe } from '@onigiri-shared/pipes/date';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { InvoicesApiService } from '../../../api/invoices-api.service';
import { LetDirective } from '@ngrx/component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Dialog } from '@angular/cdk/dialog';
import { DeleteInvoiceDialogComponent } from '../components/delete-invoice-dialog/delete-invoice-dialog.component';
import { CustomerNamePipe } from '@onigiri-shared/pipes/customer';
// AsyncPipe/JsonPipe not required here (using CommonModule)
import { OnigiriCurrencyPipe } from '@onigiri-shared/pipes/currency';
import { InvoiceStatusChipComponent } from './invoice-status-chip.component';
import { constVoid } from 'fp-ts/es6/function';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import { InvoiceCardComponent } from '../invoice-card/invoice-card.component';

@UntilDestroy()
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    CommonModule,
    OnigiriDatePipe,
    SkeletonModule,
    EmptyStatePlaceholderComponent,
    // OnigiriCurrencyPipe,
    OnigiriButtonComponent,
    OnigiriIconComponent,
    // LetDirective,
    OnigiriTemplate,
    // DeleteInvoiceDialogComponent,
    // CustomerNamePipe,
    InvoiceStatusChipComponent,
    InvoiceCardComponent
  ]
})
export class InvoicesPageComponent {
  // selected invoice for mobile actions overlay
  selectedInvoice = signal<InvoiceInfo | null>(null);

  openMobileMenu(entry: InvoiceInfo) {
    this.selectedInvoice.set(entry);
  }

  closeMobileMenu() {
    this.selectedInvoice.set(null);
  }

  onEditMobile() {
    const id = this.selectedInvoice()?.id;
    if (id) {
      this.closeMobileMenu();
      this.onEdit(id);
    }
  }

  onDeleteMobile() {
    const rec = this.selectedInvoice();
    if (rec) {
      this.closeMobileMenu();
      this.onDelete(rec);
    }
  }
  #router = inject(Router);
  #invoicesApi = inject(InvoicesApiService);
  #dialogs = inject(Dialog);
  #customers = inject(CustomersStore);
  #tracking = inject(TrackingStore);

  store = inject(InvoicesStore);

  isLoading = signal(true);

  invoicesData = computed(() =>
    buildRecords(this.store.invoices(), this.#customers.customers())
  );
  customer: any;

  constructor() {
    this.#setupTrackingSourcePropagation();

    this.#customers.getAll();
    this.store.getAll(() => this.isLoading.set(false));
  }

  ngOnInit(): void {}

  onCreate = rxMethod<void>(
    pipe(
      exhaustMap(() =>
        this.#invoicesApi.createInvoice().pipe(
          tapResponse(invoice => {
            this.store.invoiceDraftCreated(invoice);

            // TODO: verify
            this.#router.navigate(['./invoices', invoice.id], {
              queryParams: { rtn_to: `/invoices` }
            });

            this.#tracking.trackEvent(TRACKING.INVOICE.CREATE);
          }, constVoid)
        )
      )
    )
  );

  onEdit(id: string) {
    this.#router.navigate(['./invoices', id], {
      queryParams: { rtn_to: `/invoices` }
    });
  }

  onCopy = rxMethod<string>(
    pipe(
      exhaustMap(invoiceId => {
        return this.#invoicesApi.createInvoiceCopy(invoiceId).pipe(
          tapResponse(invoice => {
            this.store.invoiceDraftCreated(invoice);
            this.#tracking.trackEvent(TRACKING.INVOICE.CREATE);

            // TODO: verify
            this.#router.navigate(['./invoices', invoice.id], {
              queryParams: { rtn_to: `/invoices` }
            });
          }, constVoid)
        );
      })
    )
  );

  trackById(_index: number, item: any) {
    return item.id;
  }

  onDelete = rxMethod<any>(
    pipe(
      exhaustMap(record => {
        const dialogRef = this.#dialogs.open(DeleteInvoiceDialogComponent, {
          width: '600px',
          data: {
            invoiceId: record.id,
            invoiceName: record.title,
            customer: record.customer?.contactName || null
          }
        });

        return dialogRef.closed;
      })
    )
  );

  #setupTrackingSourcePropagation() {
    effect(
      () => {
        const hasInvoices = this.invoicesData().length > 0;

        this.#tracking.setTrackingSource(
          hasInvoices ? 'Invoices Page' : 'Invoices Page: Empty State'
        );
      },
      { allowSignalWrites: true }
    );
  }
}

function buildRecords(invoices: InvoiceInfo[], customers: Customer[]) {
  const result: any[] = invoices.map(x => ({
    id: x.id,
    no: x.no,
    status: x.status,
    title: x.title,
    date: x.date,
    dueDate: x.dueDate,
    amount: `${toCurrencySymbol(x.currency)}${x.amount}`,
    customer: x.customerId
      ? customers.find(c => c.id === x.customerId) || null
      : null
  }));

  return result;
}
