import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerData, Email, TRACKING } from '@onigiri-models';
import { CustomersApiService } from '@onigiri-api';
import { pipe, exhaustMap, tap } from 'rxjs';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { CustomersStore, TrackingStore } from '@onigiri-store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';
import isNil from 'lodash/isNil';


@Component({
  selector: 'app-edit-customer-dialog',
  templateUrl: './edit-customer-dialog.component.html',
  styleUrls: ['./edit-customer-dialog.component.scss'],
  imports: [
    FormsModule, ReactiveFormsModule,

    InputTextModule, InputTextareaModule,

    OnigiriIconComponent, OnigiriButtonComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCustomerDialogComponent implements OnInit {
  #api = inject(CustomersApiService);
  #store = inject(CustomersStore);
  #tracking = inject(TrackingStore);
  #cdr = inject(ChangeDetectorRef);

  #dialogRef = inject(DialogRef);
  #data: any = inject(DIALOG_DATA);

  form = new FormGroup({
    companyName: new FormControl<string | null>(null),
    contactName: new FormControl<string | null>(null),
    email: new FormControl<Email | null>(null),
    phone: new FormControl<string | null>(null),
    address: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    country: new FormControl<string | null>(null),
    state: new FormControl<string | null>(null),
    postalCode: new FormControl<string | null>(null),
    vatNumber: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null),
  });

  private _customerId: string | null = null;


  ngOnInit(): void {
    this.#setupInitialData();
  }

  onSave = rxMethod<void>(tap(
    () => {
      const isNewCustomer = isNil(this._customerId);
      const data = toCustomerData(this.form.getRawValue());

      isNewCustomer ? this.#onCreate(data) : this.#onEdit(data);
    }
  ));


  onCancel() {
    this.#dialogRef.close();
  }

  #onCreate = rxMethod<CustomerData>(pipe(
    exhaustMap(data => this.#api.createCustomer(data).pipe(
      tapResponse(
        customer => {
          this.#store.customerCreated(customer);
          this.#tracking.trackEvent(TRACKING.CUSTOMER.CREATE);
          this.#dialogRef.close(customer);
        },
        constVoid
      )
    ))
  ));

  #onEdit = rxMethod<CustomerData>(pipe(
    exhaustMap(data => this.#api.updateCustomer(this._customerId!, data).pipe(
      tapResponse(
        customer => {
          this.#store.customerUpdated(customer);
          this.#dialogRef.close(customer);
        },
        constVoid
      )
    ))
  ));

  #setupInitialData() {
    const data = this.#data;

    if (!data) { return; }

    if (data.customerId) {
      this._customerId = data.customerId;
      this.#setupFromCustomerId(data.customerId);
    } else {
      this.#setupPrepopulatedData(data);
    }

    this.#cdr.markForCheck();
  }

  #setupPrepopulatedData(data: Partial<CustomerData>) {
    const fv = toFormValue(data);
    this.form.patchValue(fv, { emitEvent: false });
    this.form.updateValueAndValidity();
  }

  #setupFromCustomerId(customerId: string) {

    const customer = this.#store.customers()
      .find(x => x.id === customerId)

    if (!customer) {
      return;
    }

    const fv = toFormValue(customer);
    this.form.patchValue(fv, { emitEvent: false });
    this.form.updateValueAndValidity();
  }
}

type InnerForm = EditCustomerDialogComponent['form'];
type InnerFormValue = ReturnType<InnerForm['getRawValue']>;

function toCustomerData(fv: InnerFormValue): CustomerData {
  return {
    companyName: fv.companyName,
    contactName: fv.contactName,
    email: fv.email,
    phone: fv.phone,
    address: fv.address,
    city: fv.city,
    country: fv.country,
    postalCode: fv.postalCode,
    state: fv.state,
    vatNumber: fv.vatNumber,
    notes: fv.notes
  };
}

function toFormValue(c: Partial<CustomerData>): InnerFormValue {
  return {
    companyName: c.companyName || null,
    contactName: c.contactName || null,
    phone: c.phone || null,
    email: c.email || null,
    address: c.address || null,
    city: c.city || null,
    country: c.country || null,
    postalCode: c.postalCode || null,
    vatNumber: c.vatNumber || null,
    state: c.state || null,
    notes: c.notes || null
  };
}