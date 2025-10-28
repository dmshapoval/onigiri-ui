import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { CustomerData } from '@onigiri-models';
import { CustomerDto, CustomerListItemDto, toCustomer, toCustomerDataDto, toCustomerListItem } from './contracts/customers';
import * as A from 'fp-ts/es6/Array';


@Injectable({ providedIn: 'root' })
export class CustomersApiService {
  #http = inject(HttpClient);


  getAllCustomers(includeDeleted: boolean = false) {
    return this.#http.get<CustomerListItemDto[]>(`${environment.onigiriApi}/api/customers?includeDeleted=${includeDeleted}`)
      .pipe(map(A.map(toCustomerListItem)));
  }

  getCustomer(customerId: string) {
    return this.#http.get<CustomerDto>(`${environment.onigiriApi}/api/customers/${customerId}`)
      .pipe(map(toCustomer));
  }


  createCustomer(data: CustomerData) {
    const payload = toCustomerDataDto(data);
    return this.#http.post<CustomerDto>(`${environment.onigiriApi}/api/customers`, payload)
      .pipe(map(toCustomer));
  }

  updateCustomer(id: string, data: CustomerData) {
    const payload = toCustomerDataDto(data);
    return this.#http.put<CustomerDto>(`${environment.onigiriApi}/api/customers/${id}`, payload)
      .pipe(map(toCustomer));
  }

  deleteCustomer(id: string) {
    return this.#http.delete<void>(`${environment.onigiriApi}/api/customers/${id}`);
  }
}

