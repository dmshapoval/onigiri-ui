import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { InvoiceEditorStore } from '../../invoice-editor.store';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  InvoiceItem, InvoiceLine, PredefinedServiceInvoiceItem, formatMoney,
  getInvoiceLineTotal, getInvoiceSubtotal
} from '@onigiri-models';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, debounceTime, exhaustMap, filter, map, pipe, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs';
import * as A from 'fp-ts/es6/Array';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { OnigiriButtonComponent, OnigiriIconComponent, castTo, isNotNil, whenIsNotNull } from '@oni-shared';
import { AsyncPipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { LetDirective } from '@ngrx/component';
import { InvoiceItemInputComponent } from '../invoice-item-input/invoice-item-input.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ServicesStore } from '@onigiri-store';


type LineForm = FormGroup<{
  item: FormControl<InvoiceItem | null>;
  quantity: FormControl<number | null>;
  rate: FormControl<number | null>;
  details: FormControl<string | null>;
}> & { _showItemDetails: boolean; };



@UntilDestroy()
@Component({
  selector: 'invoice-lines',
  standalone: true,
  templateUrl: './invoice-lines.component.html',
  styleUrls: ['./invoice-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InputNumberModule, DragDropModule,
    ReactiveFormsModule, AsyncPipe, LetDirective,
    OnigiriIconComponent, OnigiriButtonComponent,
    InvoiceItemInputComponent, InputTextareaModule
  ]
})
export class InvoiceLinesEditorComponent implements OnInit {
  #services = inject(ServicesStore);
  #editorStore = inject(InvoiceEditorStore);
  #cdr = inject(ChangeDetectorRef);

  lineControls = new FormArray<LineForm>([]);
  #lineFormDeleted = new Subject<LineForm>();


  invoiceCurrencySymbol = toSignal(
    this.#editorStore.invoiceCurrencySymbol,
    { initialValue: '$' }
  );

  subTotal = toSignal(
    this.#editorStore.lines.pipe(
      map(getInvoiceSubtotal),
      map(formatMoney)
    ), { initialValue: '' }
  );


  ngOnInit() {
    this.#setupSync();
  }

  onItemsReordered(event: CdkDragDrop<LineForm[]>) {

    const prevInd = event.previousIndex;
    const curentInd = event.currentIndex;

    if (prevInd === curentInd) { return; }

    const lineForm = this.lineControls.at(prevInd);

    this.lineControls.removeAt(prevInd, { emitEvent: false });
    this.lineControls.insert(curentInd, lineForm, { emitEvent: false });

    this.lineControls.updateValueAndValidity();
  }

  getLineTotal(x: LineForm['value']) {
    const value = getInvoiceLineTotal(x);
    return formatMoney(value);
  }

  onAddLine() {
    this.lineControls.push(this.#buildLineForm({
      quantity: 1
    }))
  }

  onDeleteLine(i: number) {
    const lineForm = this.lineControls.at(i);
    this.#lineFormDeleted.next(lineForm);
    this.lineControls.removeAt(i);
  }

  addLineDetails(lineForm: LineForm) {
    lineForm._showItemDetails = true;
  }

  clearLineDetails(lineForm: LineForm) {
    lineForm.controls.details.setValue(null);
    lineForm._showItemDetails = false;
  }

  #buildLineForm(v?: Partial<InvoiceLine>): LineForm {

    const lineForm: Omit<LineForm, '_showItemDetails'> = new FormGroup({
      item: new FormControl<InvoiceItem | null>(v?.item || null),
      rate: new FormControl<number | null>(v?.rate || null, { updateOn: 'blur' }),
      quantity: new FormControl<number | null>(v?.quantity || null, { updateOn: 'blur' }),
      details: new FormControl<string | null>(v?.details || null)
    });

    const lineFormDeleted$ = this.#lineFormDeleted
      .pipe(filter(x => x === lineForm), take(1));

    lineForm.controls.item.valueChanges
      .pipe(
        filter(v => isNotNil(v) && v.type === 'predefined'),
        castTo<PredefinedServiceInvoiceItem>(),
        map(v => this.#services.services().find(x => x.id === v.serviceId)),
        whenIsNotNull,
        takeUntil(lineFormDeleted$),
        untilDestroyed(this))
      .subscribe(service => {
        const fv = lineForm.value;

        if (service.price && !fv.rate) {
          lineForm.controls.rate.setValue(service.price, { emitEvent: false });
        }

        if (service.details) {
          lineForm.controls.details.setValue(service.details, { emitEvent: false });
          (<LineForm>lineForm)._showItemDetails = true;
        }

        lineForm.updateValueAndValidity();
        this.#cdr.markForCheck();
      });

    (<LineForm>lineForm)._showItemDetails = isNotNil(v?.details);

    return <LineForm>lineForm;
  }

  #setupSync() {

    this.#editorStore.invoiceId
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        setTimeout(() => {
          this.#setupLineData();
        }, 50);
      });


    this.lineControls.valueChanges
      .pipe(
        debounceTime(100),
        map(A.map(toInvoiceLine)),
        untilDestroyed(this))
      .subscribe(lines => this.#editorStore.updateLines(lines));
  }

  #setupLineData = rxMethod<void>(
    pipe(
      withLatestFrom(this.#editorStore.lines),
      tap(([_, lines]) => {
        this.#clearLines();
        this.#cdr.markForCheck();

        setTimeout(() => {
          lines.forEach(l => {
            const lf = this.#buildLineForm(l);
            this.lineControls.push(lf, { emitEvent: false });
          });

          this.#cdr.markForCheck();
        }, 50);
      })
    )
  );

  #clearLines() {

    this.lineControls.controls.forEach(lf => {
      this.#lineFormDeleted.next(lf);
    });

    this.lineControls.clear({ emitEvent: false });
  }
}

function toInvoiceLine(fv: LineForm['value']): InvoiceLine {
  return {
    item: fv.item || null,
    rate: fv.rate || null,
    quantity: fv.quantity || null,
    details: fv.details || null
  }
}