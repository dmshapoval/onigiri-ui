import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { BusinessInfoStore, } from '@onigiri-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { or } from 'fp-ts/es6/Predicate';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import { exhaustMap, pipe, switchMap, take, tap } from 'rxjs';
import { BusinessDetails, BusinessEntityData } from '@onigiri-models';
import { InvoiceEditorStore } from '../../invoice-editor.store';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EditBusinessDetailsDialogComponent } from '../edit-business-details-dialog/edit-business-details-dialog.component';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { AddressComponent } from '../../../components/address.component';
import { CustomerSelectorComponent } from '../../../../clients/customer-selector/customer-selector.component';
import { EditCustomerDialogComponent } from '../../../../clients/edit-customer-dialog/edit-customer-dialog.component';
import { LetDirective } from '@ngrx/component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

interface BilledFromData {
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  vatNumber: string | null;
}

@UntilDestroy()
@Component({
  selector: 'invoice-counterparts',
  standalone: true,
  templateUrl: 'invoice-counterparts.component.html',
  styleUrls: ['./invoice-counterparts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent, AddressComponent,
    ReactiveFormsModule, EditCustomerDialogComponent,
    OnigiriIconComponent, CustomerSelectorComponent,
    LetDirective
  ]
})
export class InvoiceCounterpartsComponent implements OnInit {

  #cdr = inject(ChangeDetectorRef);
  #businesses = inject(BusinessInfoStore);
  editorStore = inject(InvoiceEditorStore);
  #dialogs = inject(Dialog);

  billedFrom = computed(() => {
    return toBilledFromData({
      contactName: this.#businesses.contactName(),
      companyName: this.#businesses.companyName(),
      address: this.#businesses.address(),
      city: this.#businesses.city(),
      country: this.#businesses.country(),
      email: this.#businesses.email(),
      logo: this.#businesses.logo(),
      phone: this.#businesses.phone(),
      postalCode: this.#businesses.postalCode(),
      state: this.#businesses.state(),
      vatNumber: this.#businesses.vatNumber()
    })
  });

  billedToControl = new FormControl<string | null>(null);

  businesDetailsNotSpecified = computed(() => {
    const billedFrom = this.billedFrom();

    return !billedFrom || Object.values(billedFrom).every(or(isNil)(isEmpty));
  });


  ngOnInit() {

    this.#setupBusinessDetailsChangeHandler();
    this.#setupBilledToSync();
  }

  onEditBusinessDetails = rxMethod<void>(pipe(
    exhaustMap(() => {
      const dialogRef = this.#dialogs.open(EditBusinessDetailsDialogComponent, {});
      return dialogRef.closed;
    }),
    tap(() => this.#cdr.markForCheck())
  ));

  onEditSelectedCustomer = rxMethod<string>(exhaustMap(
    customerId => {
      const dialogRef = this.#dialogs.open(EditCustomerDialogComponent, {
        data: { customerId }
      });

      return dialogRef.closed;
    }
  ));

  onClearSelectedCustomer() {
    this.billedToControl.setValue(null);
  }

  #setupBilledToSync() {

    this.editorStore.invoiceId.pipe(
      switchMap(() => this.editorStore.billedTo.pipe(take(1))),
      untilDestroyed(this)
    ).subscribe(customerId => {
      this.billedToControl.setValue(customerId, { emitEvent: false });
      this.#cdr.markForCheck();
    });

    this.billedToControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(billedTo => this.editorStore.updateBilledTo(billedTo));
  }

  #setupBusinessDetailsChangeHandler() {
    // this.#navStore
    //   .select(selectAppUser).pipe(
    //     whenIsNotNull, shareReplay(1),
    //     untilDestroyed(this))
    //   .subscribe(u => {
    //     this.billedFrom = toBilledFromData(u.businessDetails);
    //     this.#cdr.markForCheck()
    //   });
  }
}

function toBilledFromData(data: BusinessEntityData): BilledFromData {
  let cityStateCode: string = '';
  if (data.city) {
    cityStateCode += data.city
  }

  if (data.state) {
    cityStateCode = isEmpty(cityStateCode) ? cityStateCode : cityStateCode + ', ';
    cityStateCode += data.state;
  }

  if (data.postalCode) {
    cityStateCode = isEmpty(cityStateCode) ? cityStateCode : cityStateCode + ', ';
    cityStateCode += data.postalCode;
  }

  const result: BilledFromData = {
    companyName: data.companyName || null,
    contactName: data.contactName || null,
    address: data.address || null,
    country: data.country || null,
    email: data.email || null,
    city: data.city || null,
    phone: data.phone || null,
    postalCode: data.postalCode || null,
    state: data.state || null,
    vatNumber: data.vatNumber || null
  };

  return result;
}