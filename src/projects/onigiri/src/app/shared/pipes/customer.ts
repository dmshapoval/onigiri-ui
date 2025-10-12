import { Pipe, PipeTransform, inject } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CustomersStore } from '@onigiri-store';

type CustomerIdOpt = string | null | undefined;
type CustomerNameOpt = string | null | undefined;

@UntilDestroy()
@Pipe({
  name: 'customerName',
  standalone: true,
  pure: true
})
export class CustomerNamePipe implements PipeTransform {
  #store = inject(CustomersStore);

  transform(customerId: CustomerIdOpt): CustomerNameOpt {
    const customer = this.#store.customers().find(x => x.id === customerId);
    return customer ? (customer.companyName || '(Not named)') : null;
  }
}