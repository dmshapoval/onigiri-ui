import { AbstractControl, FormArray, FormControlStatus, FormGroup, ValidationErrors } from "@angular/forms";
import { distinctUntilChanged, map, startWith } from "rxjs";
import { isNotNil } from "./common";


type FormErrors = FormGroup['errors'];

export type ControlResult<T> = T extends string
  ? string | null
  : T extends boolean
  ? boolean | null
  : T extends number
  ? number | null
  : T extends (infer TItem)[]
  ? ControlResult<TItem>[] | null
  : { [TK in keyof T]: T[TK] | null | undefined };


export type ValueChangesHandler<T> = (v: ControlResult<T> | null) => void;

export function addFormError(errors: FormErrors, errorKey: string, errorValue: string | boolean = true): FormErrors {
  const result: ValidationErrors = {
    ...(errors || {}),
  };

  result[errorKey] = errorValue;

  return result;
}

export function getAggregatedErrors(parentControl: AbstractControl<any>): ValidationErrors | null {
  const errors: ValidationErrors = {};

  let nestedControls: { key: string; control: AbstractControl<any> }[] = [];

  if (isFormArray(parentControl)) {
    nestedControls = parentControl.controls.map((c, i) => ({
      key: i.toString(),
      control: c,
    }));
  } else if (isFormGroup(parentControl)) {
    nestedControls = Object.keys(parentControl.controls).map((key) => ({
      key: key,
      control: parentControl.controls[key],
    }));
  } else if (parentControl.errors) {
    // current control is plain FormControl
    Object.assign(errors, parentControl.errors);
  }

  nestedControls.forEach((item) => {
    const nestedErrors = getAggregatedErrors(item.control);
    if (hasErrors(nestedErrors)) {
      errors[item.key] = nestedErrors;
    }
  });

  return hasErrors(errors) ? errors : null;
}

export function hasErrors(errors: ValidationErrors | null) {
  return isNotNil(errors) && Object.keys(errors).length > 0;
}

export function isStatusInvalid(s: FormControlStatus) {
  return s === 'INVALID';
}

export function createControlStatusSelector(c: AbstractControl<any>) {
  return c.statusChanges.pipe(startWith(c.status), distinctUntilChanged());
}

export function createControlInvalidStatusSelector(c: AbstractControl<any>) {
  return c.statusChanges.pipe(startWith(c.status), map(isStatusInvalid), distinctUntilChanged());
}

function isFormArray(c: AbstractControl<any>): c is FormArray<AbstractControl<any>> {
  return c instanceof FormArray;
}

function isFormGroup(c: AbstractControl<any>): c is FormGroup<any> {
  return c instanceof FormGroup;
}