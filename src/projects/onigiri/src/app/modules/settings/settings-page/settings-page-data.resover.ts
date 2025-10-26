import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { getState } from "@ngrx/signals";
import { BusinessesApiService } from "@onigiri-api";
import { BusinessEntity } from "@onigiri-models";
import { BusinessInfoStore } from "@onigiri-store";
import { catchError, of, retry, tap } from "rxjs";

export const businessEntityResolver: ResolveFn<BusinessEntity | null> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const businessEnitiesApi = inject(BusinessesApiService);
  const store = inject(BusinessInfoStore);
  
  if(store.entityId()) {
    return getState(store);
  }
  
  return businessEnitiesApi.getDefaultBusinessEntity().pipe(
     retry({ count: 3, delay: 1000 }),
     tap(data => {
        store.setState(data);
     }),
     catchError(() => {
        console.error("Failed to get default business entity")
        return of(null);
     })
  );
};
