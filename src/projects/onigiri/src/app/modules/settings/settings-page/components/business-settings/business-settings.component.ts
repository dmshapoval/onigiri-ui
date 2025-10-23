import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Signal, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BusinessDetails, BusinessEntityData, Email } from '@onigiri-models';
import { BusinessInfoStore, } from '@onigiri-store';
import { concatMap, map } from 'rxjs';
import { BusinessesApiService } from '@onigiri-api';
import { InputTextModule } from 'primeng/inputtext';
import { ImageUploadComponent } from '@onigiri-shared/components/image-upload/image-upload.component';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

@UntilDestroy()
@Component({
  selector: 'business-settings',
  standalone: true,
  templateUrl: './business-settings.component.html',
  styleUrls: ['./business-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    InputTextModule, ImageUploadComponent
  ]
})
export class BusinessSettingsComponent implements OnInit {

  #api = inject(BusinessesApiService);
  #businessEntitiesStore = inject(BusinessInfoStore);

  form = new FormGroup({
    companyName: new FormControl<string | null>(null, { updateOn: 'blur' }),
    contactName: new FormControl<string | null>(null, { updateOn: 'blur' }),
    email: new FormControl<Email | null>(null, { updateOn: 'blur' }),
    phone: new FormControl<string | null>(null, { updateOn: 'blur' }),
    address: new FormControl<string | null>(null, { updateOn: 'blur' }),
    city: new FormControl<string | null>(null, { updateOn: 'blur' }),
    country: new FormControl<string | null>(null, { updateOn: 'blur' }),
    state: new FormControl<string | null>(null, { updateOn: 'blur' }),
    postalCode: new FormControl<string | null>(null, { updateOn: 'blur' }),
    vatNumber: new FormControl<string | null>(null),
  });

  logoControl = new FormControl<string | null>(null);

  constructor() {
    this.#setupSync();
  }

  ngOnInit() {

    const entityId = this.#businessEntitiesStore.entityId();

    this.form.valueChanges.pipe(
      map(fv => toBusinessDetails(fv, this.logoControl.value)),
      concatMap(data => this.#api.updateBusinessEntity(entityId, data).pipe(
        tapResponse(
          () => this.#businessEntitiesStore.dataChanged(data),
          constVoid
        ))
      ),
      untilDestroyed(this)
    ).subscribe();

    // this.logoControl.valueChanges.pipe(
    //   concatMap(imageId => this.#api.updateLogo(imageId).pipe(
    //     tapResponse(
    //       () => this.#businessEntitiesStore.logoUpdated(imageId),
    //       constVoid
    //     ))
    //   ),
    //   untilDestroyed(this)
    // ).subscribe();
  }

  #setupSync() {

    const setupFor = <T>(signalRef: Signal<T>, control: FormControl<T | null>) => {
      control.setValue(signalRef(), { emitEvent: false });

      effect(() => {
        const fromStore = signalRef();

        if (fromStore !== control.value) {
          control.setValue(fromStore, { emitEvent: false });
        }
      });
    };

    setupFor(
      this.#businessEntitiesStore.logo,
      this.logoControl
    );

    setupFor(
      this.#businessEntitiesStore.companyName,
      this.form.controls.companyName
    );

    setupFor(
      this.#businessEntitiesStore.contactName,
      this.form.controls.contactName
    );

    setupFor(
      this.#businessEntitiesStore.phone,
      this.form.controls.phone
    );

    setupFor(
      this.#businessEntitiesStore.email,
      this.form.controls.email
    );

    setupFor(
      this.#businessEntitiesStore.address,
      this.form.controls.address
    );

    setupFor(
      this.#businessEntitiesStore.city,
      this.form.controls.city
    );


    setupFor(
      this.#businessEntitiesStore.country,
      this.form.controls.country
    );

    setupFor(
      this.#businessEntitiesStore.postalCode,
      this.form.controls.postalCode
    );

    setupFor(
      this.#businessEntitiesStore.state,
      this.form.controls.state
    );

    setupFor(
      this.#businessEntitiesStore.vatNumber,
      this.form.controls.vatNumber
    );

  }
}


type InneFormValue = BusinessSettingsComponent['form']['value'];
function toBusinessDetails(fv: InneFormValue, logo: string | null): BusinessEntityData {
  return {
    companyName: fv.companyName || null,
    contactName: fv.contactName || null,
    email: fv.email || null,
    phone: fv.phone || null,
    address: fv.address || null,
    city: fv.city || null,
    country: fv.country || null,
    postalCode: fv.postalCode || null,
    state: fv.state || null,
    vatNumber: fv.vatNumber || null,
    logo
  };
}