import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OnigiriButtonComponent, OnigiriIconComponent } from '@oni-shared';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnigiriDateInputComponent, dateRangeValidator } from '@onigiri-shared/components/date-input/date-input.component';
import { startOfDay } from 'date-fns';

@Component({
  selector: 'mark-as-paid-dialog',
  standalone: true,
  templateUrl: './mark-as-paid-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent,
    ReactiveFormsModule,
    OnigiriDateInputComponent, OnigiriButtonComponent
  ]
})
export class MarkAsPaidDialogComponent {

  #dialogRef = inject(DialogRef);

  dateInput = new FormControl<Date>(new Date(), {
    nonNullable: true,
    validators: [Validators.required, dateRangeValidator(dateIsTodayOrInThePast)]
  });

  disabledDatesSelector(value: Date) {
    return !dateIsTodayOrInThePast(value);
  }

  onConfirm() {
    const date = this.dateInput.value;
    this.#dialogRef.close(date);
  }

  onCancel() {
    this.#dialogRef.close(null);
  }

}

function dateIsTodayOrInThePast(value: Date) {
  const fromControl = startOfDay(value);
  const today = startOfDay(new Date());

  return fromControl <= today;
}