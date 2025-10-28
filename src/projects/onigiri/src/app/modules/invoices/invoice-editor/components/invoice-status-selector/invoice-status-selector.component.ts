import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InvoiceStatus, InvoiceStatusType } from "@onigiri-models";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DropdownModule } from "primeng/dropdown";
import { Observable } from "rxjs";
import { exhaustiveCheck, CustomControlBase } from "@oni-shared";
import { match } from "ts-pattern";

interface StatusOption {
  label: string;
  value: InvoiceStatusType;
}

@UntilDestroy()
@Component({
  selector: "invoice-status-selector",
  standalone: true,
  templateUrl: "./invoice-status-selector.component.html",
  styleUrls: ["./invoice-status-selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DropdownModule]
})
export class InvoiceStatusSelectorComponent
  extends CustomControlBase<InvoiceStatusType>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);

  innerControl = new FormControl<InvoiceStatusType>("draft", { nonNullable: true });

  get selectedStatus() {
    return this.innerControl.value;
  }

  statuses: StatusOption[] = [
    {
      label: "Draft",
      value: "draft"
    },
    {
      label: "Sent",
      value: "sent"
    },
    {
      label: "Paid",
      value: "paid"
    },
    {
      label: "Overdue",
      value: "overdue"
    }
  ];

  selectedStatusBG: Observable<string>;

  override writeValue(value: InvoiceStatusType): void {
    this.innerControl.setValue(value || "draft", { emitEvent: false });
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.innerControl.disable() : this.innerControl.enable();
  }

  ngOnInit(): void {
    this.innerControl.valueChanges.pipe(untilDestroyed(this)).subscribe(v => {
      this.onChange(v);
    });
  }

  getStatusBGColor(value: InvoiceStatusType) {
    return match(value)
      .with("draft", () => "var(--color-grey-200)")
      .with("sent", () => "var(--color-blue-200)")
      .with("paid", () => "var(--color-green-200)")
      .with("overdue", () => "var(--color-red-200)")
      .exhaustive();
  }
}
