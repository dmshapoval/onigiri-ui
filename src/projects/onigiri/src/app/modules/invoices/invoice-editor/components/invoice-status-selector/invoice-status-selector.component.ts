import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InvoiceStatus } from "@onigiri-models";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DropdownModule } from "primeng/dropdown";
import { Observable } from "rxjs";
import { exhaustiveCheck, CustomControlBase } from "@oni-shared";

interface StatusOption {
  label: string;
  value: InvoiceStatus;
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
  extends CustomControlBase<InvoiceStatus>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);

  innerControl = new FormControl<InvoiceStatus>("draft", { nonNullable: true });

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

  override writeValue(value: InvoiceStatus): void {
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

  getStatusBGColor(value: InvoiceStatus) {
    switch (value) {
      case "draft": {
        return "var(--color-grey-200)";
      }
      case "sent": {
        return "var(--color-blue-200)";
      }
      case "paid": {
        return "var(--color-green-200)";
      }
      case "overdue": {
        return "var(--color-red-200)";
      }
      default: {
        exhaustiveCheck(value);
        return "";
      }
    }
  }
}
