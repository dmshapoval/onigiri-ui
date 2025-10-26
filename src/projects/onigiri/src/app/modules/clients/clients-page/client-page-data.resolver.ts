import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { CustomersApiService } from "@onigiri-api";
import { CustomerListItem } from "@onigiri-models";
import { catchError, of, retry } from "rxjs";

export const clientsListDataResolver: ResolveFn<CustomerListItem[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const customersApi = inject(CustomersApiService);
    
  return customersApi.getAllCustomers().pipe(
     retry({ count: 3, delay: 1000 }),
     catchError(() => {
        console.error("Failed to get all customers")
        return of([]);
     })
  );
};