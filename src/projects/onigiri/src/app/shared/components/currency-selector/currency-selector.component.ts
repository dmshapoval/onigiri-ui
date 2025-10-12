import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Currency } from "@onigiri-models";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { distinctUntilChanged } from "rxjs";
import { DropdownModule } from "primeng/dropdown";
import { CustomControlBase } from "@oni-shared";

interface CurrencyOption {
  label: string;
  value: Currency;
}

@UntilDestroy()
@Component({
  selector: "currency-selector",
  standalone: true,
  templateUrl: "./currency-selector.component.html",
  styleUrls: ["./currency-selector.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DropdownModule]
})
export class CurrencySelectorComponent
  extends CustomControlBase<Currency>
  implements OnInit
{
  private _cdr = inject(ChangeDetectorRef);

  innerControl = new FormControl<Currency | null>(null);

  currencies: Currency[];

  override writeValue(value: Currency | null): void {
    this.innerControl.setValue(value, { emitEvent: false });
    this._cdr.markForCheck();
  }

  override setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.innerControl.disable({ emitEvent: false })
      : this.innerControl.enable({ emitEvent: false });
  }

  getCurrencyFlagClasses(v: Currency | null) {
    if (!v) {
      return "";
    }

    const countryCode = CURRECY_TO_COUNTRY_CODE[v];
    return `fi fi-${countryCode}`;
  }

  ngOnInit(): void {
    this.innerControl.valueChanges
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(v => {
        this.onChange(v);
      });

    const defaultCurrencies: Currency[] = ["USD", "EUR", "GBP", "CAD", "AUD"];
    const otherCurrencies = Object.keys(CURRECY_TO_COUNTRY_CODE)
      .map(c => <Currency>c)
      .filter(c => !defaultCurrencies.includes(c))
      .sort((x, y) => x.localeCompare(y));

    this.currencies = [...defaultCurrencies, ...otherCurrencies];
  }
}

const CURRECY_TO_COUNTRY_CODE: Record<Currency, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  CAD: "ca",
  AUD: "au",

  CNY: "cn",
  INR: "in",
  MYR: "my",
  KRW: "kr",
  SGD: "sg",
  TWD: "tw",
  TRY: "tr",
  BGN: "bg",
  CZK: "cz",
  DKK: "dk",
  ISK: "is",
  MDL: "md",
  NOK: "no",
  PLN: "pl",
  RON: "ro",
  RSD: "rs",
  SEK: "se",
  CHF: "ch",
  UAH: "ua",
  ARS: "ar",
  CLP: "cl",
  MXN: "mx",
  BRL: "br"
};
