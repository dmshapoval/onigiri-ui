import { Pipe, PipeTransform } from '@angular/core';
import { DATE_FORMAT } from '@onigiri-models';
import { format } from 'date-fns';

@Pipe({
  name: 'oDate',
  standalone: true,
  pure: true
})
export class OnigiriDatePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): any {
    if (!value) { return ''; }

    const date = new Date(value);
    return format(date, DATE_FORMAT);
  }
}