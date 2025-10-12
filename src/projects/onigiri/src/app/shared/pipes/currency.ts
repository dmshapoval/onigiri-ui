import { Pipe, PipeTransform } from '@angular/core';
import { Currency, toCurrencySymbol } from '@onigiri-models';

@Pipe({
  name: 'oCurrency',
  standalone: true,
  pure: true
})
export class OnigiriCurrencyPipe implements PipeTransform {
  transform(value: Currency | null | undefined): any {
    return toCurrencySymbol(value);
  }
}