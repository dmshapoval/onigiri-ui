import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import {
  pipe,
  exhaustMap,
  tap,
  filter,
  concatMap
} from 'rxjs';
import {
  CustomersStore, InvoicesStore,
  TrackingStore,

} from '@onigiri-store';
import { Customer, InvoiceInfo, InvoiceStatus, TRACKING, toCurrencySymbol } from '@onigiri-models';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TableModule } from 'primeng/table';
import { OnigiriButtonComponent, OnigiriIconComponent, OnigiriTemplate, isTruthy } from '@oni-shared';
import { OnigiriDatePipe } from '@onigiri-shared/pipes/date';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { LetDirective } from '@ngrx/component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { Dialog } from '@angular/cdk/dialog';
import { DeleteInvoiceDialogComponent } from '../components/delete-invoice-dialog/delete-invoice-dialog.component';
import { CustomerNamePipe } from '@onigiri-shared/pipes/customer';
import { AsyncPipe } from '@angular/common';
import { OnigiriCurrencyPipe } from '@onigiri-shared/pipes/currency';
import { InvoiceStatusChipComponent } from './invoice-status-chip.component';
import { constVoid } from 'fp-ts/es6/function';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import { InvoicesApiService } from '@onigiri-api';


interface DataRecord {
  id: string;
  title: string | null;
  no: string | null;
  date: Date | null;
  dueDate: Date | null;
  amount: string; // {currency}{amount}
  customer: string | null;
  status: InvoiceStatus;
}

@UntilDestroy()
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  templateUrl: './invoices-page.component.html',
  styleUrls: ['./invoices-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule, OnigiriDatePipe, SkeletonModule,
    EmptyStatePlaceholderComponent, OnigiriCurrencyPipe,
    OnigiriButtonComponent, OnigiriIconComponent, LetDirective,
    OnigiriTemplate, DeleteInvoiceDialogComponent,
    CustomerNamePipe, AsyncPipe, InvoiceStatusChipComponent
  ]
})
export class InvoicesPageComponent {

  #router = inject(Router);
  #invoicesApi = inject(InvoicesApiService);
  #dialogs = inject(Dialog);
  #tracking = inject(TrackingStore);

  store = inject(InvoicesStore);

  isLoading = signal(true);

  invoicesData = computed(() => buildRecords(this.store.invoices()));

  constructor() {
    this.#setupTrackingSourcePropagation();

    this.#refreshInvoices();
  }


  ngOnInit(): void {

  }

  onCreate = rxMethod<void>(pipe(
    exhaustMap(() => this.#invoicesApi.createInvoice().pipe(
      tapResponse(
        invoice => {
          this.store.refreshState();

          // TODO: verify
          this.#router.navigate(['./invoices', invoice.id], {
            queryParams: { rtn_to: `/invoices` }
          });

          this.#tracking.trackEvent(TRACKING.INVOICE.CREATE);
        },
        constVoid
      )
    ))
  ));

  onEdit(id: string) {
    this.#router.navigate(['./invoices', id], {
      queryParams: { rtn_to: `/invoices` }
    });
  }

  onCopy = rxMethod<string>(pipe(
    exhaustMap(invoiceId => {
      return this.#invoicesApi.createInvoiceCopy(invoiceId).pipe(
        tapResponse(
          invoice => {

            this.store.refreshState();
            this.#tracking.trackEvent(TRACKING.INVOICE.CREATE);

            // TODO: verify
            this.#router.navigate(['./invoices', invoice.id], {
              queryParams: { rtn_to: `/invoices` }
            });
          },
          constVoid
        )
      )
    })
  ));

  onDelete = rxMethod<DataRecord>(pipe(
    exhaustMap(record => {

      const dialogRef = this.#dialogs.open(DeleteInvoiceDialogComponent, {
        width: '600px',
        data: {
          invoiceId: record.id,
          invoiceName: record.title,
          customer: record.customer
        }
      });

      return dialogRef.closed;
    })
  ));

  async #refreshInvoices() {
    this.isLoading.set(true);
    await this.store.refreshState();
    this.isLoading.set(false);
  }

  #setupTrackingSourcePropagation() {
    // effect(() => {
    //   const hasInvoices = this.store.invoices().length > 0;

    //   this.#tracking.setTrackingSource(hasInvoices
    //     ? 'Invoices Page'
    //     : 'Invoices Page: Empty State')

    // }, { allowSignalWrites: true })
  }
}

function buildRecords(invoices: InvoiceInfo[]) {
  const result: DataRecord[] = invoices.map(x => ({
    id: x.id,
    no: x.no,
    status: x.status,
    title: x.title,
    date: x.date,
    dueDate: x.dueDate,
    amount: `${toCurrencySymbol(x.currency)}${x.amount}`,
    customer: x.customer,
  }));

  return result;
}
