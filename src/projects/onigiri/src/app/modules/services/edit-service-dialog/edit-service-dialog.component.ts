import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicesApiService } from '@onigiri-api';
import { ServicesStore, TrackingStore, } from '@onigiri-store';
import { pipe, exhaustMap, tap } from 'rxjs';
import { ServiceData, TRACKING } from '@onigiri-models';
import isNil from 'lodash/isNil';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

@Component({
  selector: 'edit-service-dialog',
  templateUrl: './edit-service-dialog.component.html',
  styleUrls: ['./edit-service-dialog.component.scss'],
  imports: [
    InputNumberModule,
    FormsModule, ReactiveFormsModule,

    InputTextModule, InputNumberModule, InputTextareaModule,

    OnigiriIconComponent, OnigiriButtonComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditServiceDialogComponent implements OnInit {

  #data: any = inject(DIALOG_DATA);
  #dialogRef = inject(DialogRef);

  #tracking = inject(TrackingStore);
  #api = inject(ServicesApiService);
  #store = inject(ServicesStore);
  #cdr = inject(ChangeDetectorRef);
  _waitingForServer = false;

  _serviceId: string | null;

  form = new FormGroup({
    id: new FormControl<string | null>(null),
    name: new FormControl<string | null>(null),
    details: new FormControl<string | null>(null),
    price: new FormControl<number | null>(null),
  });

  ngOnInit() {
    this._setupInitialData();
  }

  onSave = rxMethod<void>(tap(() => {
    const isNewService = isNil(this._serviceId);
    const data = toServiceData(this.form.getRawValue());

    isNewService ? this.#onCreate(data) : this.#onEdit(data);
  }));


  onCancel() {
    this.#dialogRef.close();
  }

  #onCreate = rxMethod<ServiceData>(pipe(
    exhaustMap(data => this.#api.createService(data).pipe(
      tapResponse(
        svc => {
          this.#store.serviceCreated(svc);
          this.#tracking.trackEvent(TRACKING.SERVICE.CREATE);
          this.#dialogRef.close(svc);
        },
        constVoid
      )
    ))
  ));

  #onEdit = rxMethod<ServiceData>(pipe(
    exhaustMap(data => this.#api.updateService(this._serviceId!, data).pipe(
      tapResponse(
        svc => {
          this.#store.serviceUpdated(svc);
          this.#dialogRef.close(svc);
        },
        constVoid
      )
    ))
  ));

  private _setupInitialData() {
    const data = this.#data;

    if (!data) { return; }

    if (data.serviceId) {
      this._serviceId = data.serviceId;
      this.#setupFromServiceId(data.serviceId);
    } else {
      this.#setupPrepopulatedData(data);
    }

    this.#cdr.markForCheck();
  }

  #setupFromServiceId(serviceId: string) {

    const service = this.#store.services().find(x => x.id === serviceId);

    if (!service) {
      return;
    }

    const fv = toFormValue(service);
    this.form.patchValue(fv, { emitEvent: false });
    this.form.updateValueAndValidity();
  }

  #setupPrepopulatedData(data: Partial<ServiceData>) {
    const fv = toFormValue(data);
    this.form.patchValue(fv, { emitEvent: false });
    this.form.updateValueAndValidity();
  }
}

type InnerForm = EditServiceDialogComponent['form'];
type InnerFormValue = InnerForm['value'];

function toServiceData(fv: InnerFormValue): ServiceData {
  return {
    name: fv.name || null,
    details: fv.details || null,
    price: fv.price || null,
  };
}

function toFormValue(s: Partial<ServiceData>): InnerFormValue {
  return {
    name: s.name,
    details: s.details,
    price: s.price
  };
}