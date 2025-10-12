import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Period } from "@onigiri-models";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { distinctUntilChanged } from "rxjs";
import { DropdownModule } from "primeng/dropdown";
import { CustomControlBase } from "@oni-shared";

interface PeriodOption {
  label: string;
  value: Period;
}

@UntilDestroy()
@Component({
  selector: "period-selector",
  standalone: true,
  templateUrl: "./period-selector.component.html",
  styleUrls: ["./period-selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DropdownModule]
})
export class PeriodSelectorComponent
  extends CustomControlBase<Period>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);

  innerControl = new FormControl<Period | null>(null);

  options: PeriodOption[] = [
    { label: "This Week", value: "this_week" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Last 3 Month", value: "last_3_months" },
    { label: "This Year", value: "this_year" },
    { label: "Last Year", value: "last_year" },
    { label: "All time", value: "all_time" }
  ];

  override writeValue(value: Period | null): void {
    this.innerControl.setValue(value || "this_month", { emitEvent: false });
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.innerControl.disable({ emitEvent: false })
      : this.innerControl.enable({ emitEvent: false });
  }

  ngOnInit(): void {
    this.innerControl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(v => {
        this.onChange(v);
      });
  }
}
