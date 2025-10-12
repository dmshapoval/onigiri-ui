import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { BusinessDetails, Email } from '@onigiri-models';
import { BusinessesApiService } from '@onigiri-api';
import { BusinessInfoStore, } from '@onigiri-store';

import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom, tap } from 'rxjs';
import { ImageUploadComponent } from '@onigiri-shared/components/image-upload/image-upload.component';
import { getState } from '@ngrx/signals';

@Component({
  selector: 'edit-business-details-dialog',
  standalone: true,
  templateUrl: './edit-business-details-dialog.component.html',
  styleUrls: ['./edit-business-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, InputTextModule,
    OnigiriIconComponent, OnigiriButtonComponent,
    ImageUploadComponent
  ]
})
export class EditBusinessDetailsDialogComponent implements OnInit {

  #businesses = inject(BusinessInfoStore);
  #dialogRef = inject(DialogRef);

  #api = inject(BusinessesApiService);

  _waitingForServer = false;

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
    logo: new FormControl<string | null>(null)
  });

  async ngOnInit() {


    const settings = getState(this.#businesses);


    this.form.patchValue({
      companyName: settings.companyName || null,
      contactName: settings.contactName || null,
      phone: settings.phone || null,
      email: settings.email || null,
      address: settings.address || null,
      city: settings.city || null,
      country: settings.country || null,
      postalCode: settings.postalCode || null,
      state: settings.state || null,
      vatNumber: settings.vatNumber || null,
      logo: settings.logo
    });
  }

  async onSave() {
    if (this.form.invalid || this._waitingForServer) { return; }
    this._waitingForServer = true;

    const fv = this.form.value;

    const logoImageId = fv.logo || null;
    const data: BusinessDetails = {
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
      logo: logoImageId
    };

    const saveBD = this.#api.updateBusinessDetails(data)
      .pipe(tap(() => this.#businesses.businessDetailsUpdated(data)));

    const saveLogo = this.#api.updateLogo(fv.logo || null)
      .pipe(tap(() => this.#businesses.logoUpdated(logoImageId)));

    await Promise.all([
      firstValueFrom(saveBD),
      firstValueFrom(saveLogo),
    ]);

    this.#dialogRef.close();
  }

  onCancel() {
    this.#dialogRef.close();
  }
}
