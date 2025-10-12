import { Injectable, signal } from '@angular/core';
import { concatMap, Observable, pipe, tap } from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

type ApiRequest = () => Observable<any>;

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class ApiRequestsService {
  requestsCount = signal(0);

  send = rxMethod<ApiRequest>(
    pipe(
      tap(() => this.requestsCount.update(x => x + 1)),
      concatMap(req =>
        req().pipe(
          tapResponse(
            () => {
              this.requestsCount.update(x => x - 1);
            },
            () => {
              // TODO:notify
              this.requestsCount.update(x => x - 1);
            }
          )
        )
      )
    )
  );
}
