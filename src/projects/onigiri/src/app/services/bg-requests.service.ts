import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tapResponse } from '@ngrx/operators';

import { BehaviorSubject, Observable, Subject, concatMap, tap } from 'rxjs';

type ApiRequest = () => Observable<any>;

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class BackgroundRequestsService {
  #queueLength = new BehaviorSubject<number>(0);
  #requests = new Subject<ApiRequest>();

  constructor() { this.#setupRequestsHandling(); }

  schedule(req: ApiRequest) {
    this.#requests.next(req);
  }

  #setupRequestsHandling() {
    this.#requests
      .pipe(
        tap(() => this.#incrementQueueLength()),
        concatMap(r => r().pipe(tapResponse(
          () => this.#decrementQueueLength(),
          e => {
            // TODO: notify
            this.#decrementQueueLength();
          }
        ))),
        untilDestroyed(this))
      .subscribe();
  }

  // private _setupProcessing() {
  //   this._requests$.pipe(
  //     tap(() => this._incrementQueueLength()),
  //     concatMap(req => req.execute().pipe(
  //       catchError(e => {
  //         console.warn('Failed to execute background request', e);
  //         return of(null)
  //       })
  //     )),
  //     tap(() => this._decrementQueueLength()),
  //   )
  // }

  #incrementQueueLength() {
    const newLength = this.#queueLength.getValue() + 1;
    this.#queueLength.next(newLength);
  }

  #decrementQueueLength() {
    const newLength = this.#queueLength.getValue() - 1;
    this.#queueLength.next(Math.max(0, newLength));
  }
}