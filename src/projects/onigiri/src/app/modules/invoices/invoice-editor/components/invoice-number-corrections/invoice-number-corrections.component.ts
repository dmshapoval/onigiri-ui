import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InvoiceDiscount, InvoiceTax, NumberType, formatMoney, getInvoiceDiscountAmount, getInvoiceTaxAmount, getInvoiceTotal } from '@onigiri-models';
import { InvoiceEditorStore } from '../../invoice-editor.store';
import { Observable, debounceTime, map, switchMap, take } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OnigiriButtonComponent, OnigiriIconComponent, isNotNil } from '@oni-shared';
import { NumberTypeSwitchComponent } from '../number-type-switch/number-type-switch.component';
import { AsyncPipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@UntilDestroy()
@Component({
  selector: 'invoice-number-corrections',
  standalone: true,
  templateUrl: 'invoice-number-corrections.component.html',
  styleUrls: ['./invoice-number-corrections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, InputNumberModule, AsyncPipe,
    OnigiriButtonComponent, NumberTypeSwitchComponent,
    OnigiriIconComponent, InputTextModule
  ]
})
export class InvoiceNumberCorrectionsComponent implements OnInit {

  #editorStore = inject(InvoiceEditorStore);
  #cdr = inject(ChangeDetectorRef);

  invoiceCurrencySymbol$ = this.#editorStore.invoiceCurrencySymbol;

  taxForm = new FormGroup({
    text: new FormControl<string | null>(null, { updateOn: 'blur' }),
    numberType: new FormControl<NumberType | null>(null),
    value: new FormControl<number | null>(null, { updateOn: 'blur' }),
  });

  discountForm = new FormGroup({
    text: new FormControl<string | null>(null, { updateOn: 'blur' }),
    numberType: new FormControl<NumberType | null>(null),
    value: new FormControl<number | null>(null, { updateOn: 'blur' }),
  });

  get hasTax() {
    return isNotNil(this.taxForm.controls.numberType.value);
  }

  get hasDiscount() {
    return isNotNil(this.discountForm.controls.numberType.value);
  }


  invoiceTotal$: Observable<string>;
  discountAmount$: Observable<string>;
  taxAmount$: Observable<string>;


  ngOnInit() {
    this.invoiceTotal$ = this.#editorStore.invoiceData
      .pipe(map(getInvoiceTotal), map(formatMoney));

    this.discountAmount$ = this.#editorStore.invoiceData
      .pipe(map(getInvoiceDiscountAmount), map(formatMoney));

    this.taxAmount$ = this.#editorStore.invoiceData
      .pipe(map(getInvoiceTaxAmount), map(formatMoney));

    this.#setupSync();
  }

  onAddTax() {
    this.taxForm.patchValue({
      numberType: 'percent',
      text: 'Tax',
      value: 10
    });
  }

  onDeleteTax() {
    this.taxForm.patchValue({
      numberType: null,
      text: null,
      value: null
    });
  }

  onAddDiscount() {
    this.discountForm.patchValue({
      numberType: 'percent',
      text: 'Discount',
      value: 10
    });
  }

  onDeleteDiscount() {
    this.discountForm.patchValue({
      numberType: null,
      text: null,
      value: null
    });
  }

  // private _setupTaxHandlers() {
  //   const taxTypeControl = this.invoiceForm.controls.tax.controls.numberType;
  //   this.hasTax$ = taxTypeControl.valueChanges.pipe(map(isNotNil), distinctUntilChanged());
  // }

  // private _setupDiscountHandlers() {
  //   const discountTypeControl = this.invoiceForm.controls.discount.controls.numberType;
  //   this.hasDiscount$ = discountTypeControl.valueChanges.pipe(map(isNotNil), distinctUntilChanged());
  // }

  #setupSync() {

    this.#editorStore.invoiceId.pipe(
      switchMap(() => this.#editorStore.invoiceData.pipe(take(1))),
      untilDestroyed(this)
    ).subscribe(invoice => {

      if (invoice?.tax) {
        this.taxForm.patchValue({
          text: invoice.tax.text,
          numberType: invoice.tax.value.type,
          value: invoice.tax.value.value,
        }, { emitEvent: false });
      }

      if (invoice?.discount) {
        this.discountForm.patchValue({
          text: invoice.discount.text,
          numberType: invoice.discount.value.type,
          value: invoice.discount.value.value,
        }, { emitEvent: false });
      }

      this.#cdr.markForCheck();
    })


    this.taxForm.valueChanges
      .pipe(
        debounceTime(100),
        untilDestroyed(this))
      .subscribe(fv => {

        const tax: InvoiceTax | null = fv?.numberType
          ? {
            text: fv.text || null,
            value: {
              type: fv.numberType,
              value: fv.value!
            }
          }
          : null;

        this.#editorStore.updateTax(tax);
      });

    this.discountForm.valueChanges
      .pipe(
        debounceTime(100),
        untilDestroyed(this))
      .subscribe(fv => {

        const discount: InvoiceDiscount | null = fv?.numberType
          ? {
            text: fv.text || null,
            value: {
              type: fv.numberType,
              value: fv.value!
            }
          }
          : null;

        this.#editorStore.updateDiscount(discount);
      });
  }
}

// get discountAmount() {
//   const data = toInvoiceData(this.invoiceForm.value);
//   const result = getInvoiceDiscountAmount(data);

//   return formatMoney(result);
// }

// get taxAmount() {
//   const data = toInvoiceData(this.invoiceForm.value);
//   const result = getInvoiceTaxAmount(data);

//   return formatMoney(result);
// }

// get invoiceTotal() {
//   const data = toInvoiceData(this.invoiceForm.value);
//   const result = getInvoiceTotal(data);

//   return formatMoney(result);
// }