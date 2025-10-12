import { inject, Injectable } from "@angular/core";
import {
  ControlValueAccessor,
  NgControl,
  ValidationErrors
} from "@angular/forms";
import { constVoid } from "fp-ts/es6/function";
import { ValueChangesHandler } from "../tools";

@Injectable()
export abstract class CustomControlBase<T> implements ControlValueAccessor {
  constructor() {
    if (this.parentControl) {
      this.parentControl.valueAccessor = this;
    }
  }

  protected parentControl = inject(NgControl, { self: true });
  protected onTouched = constVoid;
  protected onChange: ValueChangesHandler<T> = constVoid;

  abstract writeValue(value: T | null): void;
  abstract setDisabledState(isDisabled: boolean): void;

  registerOnChange(fn: ValueChangesHandler<T>) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  protected setupErrorsPropagation(getErrors: () => ValidationErrors | null) {
    if (!this.parentControl.control) {
      console.error("Parent control was not set", this);
      return;
    }

    this.parentControl.control.addValidators([_ => getErrors()]);
  }
}
