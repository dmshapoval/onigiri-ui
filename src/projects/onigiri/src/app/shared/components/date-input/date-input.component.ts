import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject
} from "@angular/core";
import { AbstractControl, FormsModule, ValidationErrors } from "@angular/forms";
import { UntilDestroy } from "@ngneat/until-destroy";
import { OverlayPanel, OverlayPanelModule } from "primeng/overlaypanel";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isValid,
  parse
} from "date-fns";
import { constFalse } from "fp-ts/es6/function";
import { DATE_FORMAT } from "@onigiri-models";
import isNil from "lodash/isNil";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { CustomControlBase, OnigiriIconComponent, isNotNil } from "@oni-shared";

interface WeekDay {
  date: Date;
  dayOfMonth: number;
  isFromAnotherPeriod: boolean;
  isDisabled: boolean;
  // isSelected: boolean;
}

interface Week {
  days: WeekDay[];
}

@UntilDestroy()
@Component({
  selector: "o-date-input",
  templateUrl: "./date-input.component.html",
  styleUrls: ["./date-input.component.scss"],
  standalone: true,
  imports: [
    FormsModule,

    InputTextModule,
    InputTextareaModule,

    OnigiriIconComponent,
    OverlayPanelModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnigiriDateInputComponent
  extends CustomControlBase<Date>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);

  @Input() inputId: string;
  @Input() disabledDatesSelector: (x: Date) => boolean = constFalse;

  @Input() appendOverlayTo: "body" | HTMLElement;

  @ViewChild("opTarget") opTarget: ElementRef;
  @ViewChild("op") overlay: OverlayPanel;

  dateText: string | null = null;
  disabled = false;

  datePickerIsVisible = false;

  private _selectedDate: Date | null = null;
  private _year = new Date().getFullYear();
  private _month = new Date().getMonth();

  weeks: Week[] = [];

  get period() {
    const date = new Date();
    date.setFullYear(this._year);
    date.setMonth(this._month);

    return format(date, "MMMM yyyy");
  }

  get canMoveBack() {
    return this._year > 2000;
  }

  get overlayPanelStyle() {
    const width = this.opTarget?.nativeElement.clientWidth;
    return width ? { width: `width: ${width}px` } : null;
  }

  ngOnInit(): void {}

  override writeValue(value: Date | null): void {
    this._selectedDate = value;
    this._recalculateDateText();
    this._recalculateCurrentPeriod();
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  isSelectedDate(d: Date) {
    return isNotNil(this._selectedDate) && isSameDay(this._selectedDate, d);
  }

  onInputBlur() {
    // We need make async as blur event happens before 'datePickerIsVisible' is established
    setTimeout(() => {
      if (this.datePickerIsVisible) {
        return;
      }

      let newDate = this.dateText ? tryParseDate(this.dateText) : null;

      if (isNil(this._selectedDate) && isNil(newDate)) {
        return;
      }
      if (
        this._selectedDate &&
        newDate &&
        isSameDay(this._selectedDate, newDate)
      ) {
        return;
      }

      this._selectedDate = newDate;
      this._recalculateDateText();
      this.onChange(newDate);
      this._cdr.markForCheck();
    }, 100);
  }

  showDatePicker(ev: Event, target: any) {
    if (this.disabled) {
      return;
    }

    this._recalculateWeeks();
    this.datePickerIsVisible = true;
    this.overlay.show(ev, target);
  }

  onDateSelected(day: WeekDay) {
    if (day.isFromAnotherPeriod || day.isDisabled) {
      return;
    }

    this._selectedDate = day.date;
    this._recalculateDateText();
    this.onChange(day.date);

    this.overlay.hide();
    this._cdr.markForCheck();
  }

  moveToNext() {
    const nextYear = this._month === 11;
    this._month = nextYear ? 0 : this._month + 1;
    this._year += nextYear ? 1 : 0;

    this._recalculateWeeks();
  }

  moveToPrev() {
    const prevYear = this._month === 0;
    this._month = prevYear ? 11 : this._month - 1;
    this._year -= prevYear ? 1 : 0;

    this._recalculateWeeks();
  }

  private _recalculateWeeks() {
    const firstDateOfPeriod = new Date(this._year, this._month, 1);
    const lastDateOfPeriod = endOfMonth(firstDateOfPeriod);

    const isFromAnotherPeriod = function (d: Date) {
      return d < firstDateOfPeriod || d > lastDateOfPeriod;
    };

    const weekStarts = eachWeekOfInterval({
      start: firstDateOfPeriod,
      end: lastDateOfPeriod
    });

    const weeks: Week[] = weekStarts.map(startDate => {
      const endDate = endOfWeek(startDate);
      const dates = eachDayOfInterval({
        start: startDate,
        end: endDate
      });

      const result: Week = {
        days: dates.map(d => ({
          date: d,
          dayOfMonth: d.getDate(),
          isFromAnotherPeriod: isFromAnotherPeriod(d),
          isDisabled: this.disabledDatesSelector(d)
        }))
      };

      return result;
    });

    this.weeks = weeks;
  }

  private _recalculateCurrentPeriod() {
    if (this._selectedDate) {
      this._year = this._selectedDate.getFullYear();
      this._month = this._selectedDate.getMonth();
    } else {
      const now = new Date();
      this._year = now.getFullYear();
      this._month = now.getMonth();
    }
  }

  private _recalculateDateText() {
    this.dateText = this._selectedDate
      ? format(this._selectedDate, DATE_FORMAT)
      : "";
  }
}

const parsingMethods: ((v: string) => Date)[] = [
  v => parse(v, DATE_FORMAT, new Date()),
  v => parse(v, "dd/MM/yy", new Date()),
  v => parse(v, "dd/MM/yyyy", new Date()),
  v => parse(v, "dd-MM-yy", new Date()),
  v => parse(v, "dd-MM-yyyy", new Date()),
  v => parse(v, "MM/dd/yy", new Date()),
  v => parse(v, "MM/dd/yyyy", new Date()),
  v => parse(v, "MM-dd-yy", new Date()),
  v => parse(v, "MM-dd-yyyy", new Date())
];

function tryParseDate(value: string) {
  let result: Date | null = null;

  for (let i = 0; i < parsingMethods.length; i++) {
    const m = parsingMethods[i];

    try {
      const parseResult = m(value);

      result = isValid(parseResult) ? parseResult : null;

      if (result) {
        break;
      }
    } catch (error) {}
  }

  return result;
}

export function dateRangeValidator(validate: (v: Date) => boolean) {
  return (control: AbstractControl<any, any>): ValidationErrors | null => {
    const value = control.value as Date | null;

    if (isNil(value)) {
      return null;
    }

    return validate(value)
      ? null
      : { dateRange: "Date is not within allowed date range" };
  };
}
