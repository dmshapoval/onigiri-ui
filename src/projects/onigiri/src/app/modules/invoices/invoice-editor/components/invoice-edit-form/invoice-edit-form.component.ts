import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { BusinessesApiService, } from '@onigiri-api';
import {
  BusinessInfoStore,
  CustomersStore,
  TrackingStore,
} from '@onigiri-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filter, Observable } from 'rxjs';
import {
  concatMap,
  tap
} from 'rxjs';
import { Customer, InvoiceData } from '@onigiri-models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { constVoid } from 'fp-ts/es6/function';

import { InvoiceEditorStore } from '../../invoice-editor.store';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OnigiriButtonComponent, OnigiriIconComponent, } from '@oni-shared';
import { ImageUploadComponent } from '@onigiri-shared/components/image-upload/image-upload.component';
import { InvoiceCounterpartsComponent } from '../invoice-counterparts/invoice-counterparts.component';
import { InvoiceLinesEditorComponent } from '../invoice-lines/invoice-lines.component';
import { InvoiceNumberCorrectionsComponent } from '../invoice-number-corrections/invoice-number-corrections.component';
import { DownloadInvoicePDFButtonComponent } from '../../../components/download-invoice-pdf-button.component';
import { ShareLinkDialogComponent } from '../../../components';
import { OnigiriDateInputComponent } from '@onigiri-shared/components/date-input/date-input.component';
import { ProjectSelectorComponent } from '../../../../projects/project-selector/project-selector.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { CustomerNamePipe } from '@onigiri-shared/pipes/customer';
import { InvoiceStatusSelectorComponent } from '../invoice-status-selector/invoice-status-selector.component';
import { AsyncPipe } from '@angular/common';
import { CurrencySelectorComponent } from '@onigiri-shared/components/currency-selector/currency-selector.component';
import { InvoicePaymentOptionsComponent } from '../invoice-payment-options/invoice-payment-options.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';


@UntilDestroy()
@Component({
  selector: 'invoice-edit-form',
  standalone: true,
  templateUrl: './invoice-edit-form.component.html',
  styleUrls: ['./invoice-edit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent, ImageUploadComponent,
    SelectButtonModule, ReactiveFormsModule, AsyncPipe,
    InputTextModule, InputTextareaModule, InvoiceStatusSelectorComponent,
    InvoiceCounterpartsComponent, ProjectSelectorComponent,
    InvoiceLinesEditorComponent, ShareLinkDialogComponent,
    InvoiceNumberCorrectionsComponent, SkeletonModule,
    DownloadInvoicePDFButtonComponent, OnigiriDateInputComponent,
    CurrencySelectorComponent, CustomerNamePipe, OnigiriIconComponent,
    InvoicePaymentOptionsComponent
  ]
})
export class InvoiceEditFormComponent implements OnInit {

  #businesses = inject(BusinessInfoStore);
  #customers = inject(CustomersStore);
  #tracking = inject(TrackingStore);

  #accountApi = inject(BusinessesApiService);
  editorStore = inject(InvoiceEditorStore);


  constructor() {
    // NOTES: needed here as rxMethod uses injector
    this.#setupChangeHandlers();
    this.#setupBusinessDetailsChangeHandler();
    this.#setupSelectedCustomer();
  }

  logoControl = new FormControl<string | null>(null);

  titleInput = new FormControl<string | null>(null, { updateOn: 'blur' });
  invoiceNoInput = new FormControl<string | null>(null, { updateOn: 'blur' });
  invoiceNotesInput = new FormControl<string | null>(null, { updateOn: 'blur' });
  paymentDetailsInput = new FormControl<string | null>(null, { updateOn: 'blur' });
  dateInput = new FormControl<Date | null>(null);
  dueDateInput = new FormControl<Date | null>(null);


  selectedCustomer = signal<Customer | null>(null);


  ngOnInit(): void {
    this.#tracking.setTrackingSource('Invoice details');
  }

  #setupBusinessDetailsChangeHandler() {

    effect(() => {
      const logo = this.#businesses.logo();
      if (logo !== this.logoControl.value) {
        this.logoControl.setValue(logo);
      }
    }, { allowSignalWrites: true });


    // logo update handler 
    this.logoControl.valueChanges
      .pipe(
        filter(imageId => imageId !== this.#businesses.logo()),
        concatMap(imageId => {
          return this.#accountApi.updateLogo(imageId).pipe(
            tapResponse(
              () => this.#businesses.logoUpdated(imageId),
              constVoid
            )
          );
        }),
        untilDestroyed(this))
      .subscribe();
  }

  #setupChangeHandlers() {

    const createChangeHandler = <T>(changes: Observable<T>, handler: (x: T) => void) => {
      return rxMethod<T>(tap(handler))(changes);
    }

    createChangeHandler(
      this.titleInput.valueChanges,
      v => this.editorStore.updateTitle(v)
    );

    createChangeHandler(
      this.invoiceNoInput.valueChanges,
      v => this.editorStore.updateNo(v)
    );

    createChangeHandler(
      this.dateInput.valueChanges,
      v => this.editorStore.updateDate(v)
    );

    createChangeHandler(
      this.dueDateInput.valueChanges,
      v => this.editorStore.updateDueDate(v)
    );

    createChangeHandler(
      this.invoiceNotesInput.valueChanges,
      v => this.editorStore.updateNotes(v)
    );

    createChangeHandler(
      this.paymentDetailsInput.valueChanges,
      v => this.editorStore.updatePaymentDetails(v)
    );

    const clearFormValues = () => {
      this.titleInput.setValue(null, { emitEvent: false });
      this.invoiceNoInput.setValue(null, { emitEvent: false });
      this.invoiceNotesInput.setValue(null, { emitEvent: false });
      this.paymentDetailsInput.setValue(null, { emitEvent: false });
      this.dateInput.setValue(null, { emitEvent: false });
      this.dueDateInput.setValue(null, { emitEvent: false });
    }

    const updateControlValues = (data: InvoiceData) => {
      this.titleInput.setValue(data.title, { emitEvent: false });
      this.invoiceNoInput.setValue(data.no, { emitEvent: false });
      this.invoiceNotesInput.setValue(data.notes, { emitEvent: false });
      this.dateInput.setValue(data.date, { emitEvent: false });
      this.dueDateInput.setValue(data.dueDate, { emitEvent: false });
    }

    this.editorStore.state$
      .pipe(untilDestroyed(this))
      .subscribe(state => state.invoice
        ? updateControlValues(state.invoice)
        : clearFormValues()
      );
  }



  #setupSelectedCustomer() {
    // TODO: refactor
    const customerId = toSignal(this.editorStore.billedTo, { initialValue: null });
    effect(() => {
      const cId = customerId();

      const custromer = cId
        ? this.#customers.customers().find(x => x.id === cId) || null
        : null;

      this.selectedCustomer.set(custromer);
    }, { allowSignalWrites: true })
  }

}




