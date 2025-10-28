import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { InvoicesStore } from '@onigiri-store';
import { exhaustMap, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { InvoicesApiService } from '@onigiri-api';

@Component({
  selector: 'delete-invoice-dialog',
  standalone: true,
  templateUrl: './delete-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    OnigiriButtonComponent
  ]
})
export class DeleteInvoiceDialogComponent implements OnInit {
  #dialogRef = inject(DialogRef);
  #data: any = inject(DIALOG_DATA);
  #store = inject(InvoicesStore);
  #invoicesApi = inject(InvoicesApiService);

  invoiceName: string | null = null;
  customer: string | null = null;
  invoiceId: string | null = null;

  ngOnInit() {
    this.invoiceId = this.#data.invoiceId;
    this.invoiceName = this.#data.invoiceName;
    this.customer = this.#data.customer;
  }

  onConfirm = rxMethod<void>(pipe(
    exhaustMap(() => this.#invoicesApi.deleteInvoice(this.invoiceId!).pipe(
      tapResponse(
        () => {
          this.#store.invoiceDeleted(this.invoiceId!);
          this.#dialogRef.close(true);
        },
        () => this.#store.refreshState()
      )
    ))
  ));

  onCancel() {
    this.#dialogRef.close(false);
  }
}