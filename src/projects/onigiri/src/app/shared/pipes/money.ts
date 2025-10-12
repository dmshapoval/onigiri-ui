import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from '@onigiri-models';
import isNil from 'lodash/isNil';

@Pipe({
  name: 'oMoney',
  standalone: true,
  pure: true
})
export class OnigiriMoneyPipe implements PipeTransform {
  transform(value: number | null): any {
    if (isNil(value)) { return ''; }

    return formatMoney(value);
  }
}