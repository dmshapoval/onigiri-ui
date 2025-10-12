import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { NumberType } from "@onigiri-models";
import { NgSwitch, NgSwitchCase } from "@angular/common";
import { SelectButtonModule } from "primeng/selectbutton";
import { OnigiriIconComponent, CustomControlBase } from "@oni-shared";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "number-type-switch",
  standalone: true,
  templateUrl: "number-type-switch.component.html",
  styleUrls: ["./number-type-switch.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectButtonModule, OnigiriIconComponent, FormsModule]
})
export class NumberTypeSwitchComponent
  extends CustomControlBase<NumberType>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);
  private _value: NumberType | null = null;

  disabled = false;

  get value() {
    return this._value;
  }

  set value(v: NumberType | null) {
    if (this._value === v) {
      return;
    }
    this._value = v;
    this.onChange(v);
  }

  types = ["percent", "fixed"];

  ngOnInit() {}

  override writeValue(value: NumberType | null): void {
    this._value = value;
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cdr.markForCheck();
  }
}
