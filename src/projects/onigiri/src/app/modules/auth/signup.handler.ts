import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ScreenSizeTrackingService } from '@oni-shared';
import { AccountApiService } from '@onigiri-api';
import { AppUser } from '@onigiri-models';
import { AccountStore } from '@onigiri-store';
import {
  pipe,
  switchMap,
  tap,
  catchError,
  of,
  map,
  withLatestFrom
} from 'rxjs';

interface Props {
  setError: (e: string) => void;
  onCompleted: () => void;
}

interface ExecutionProps {
  onError(err: string): void;
  onCompleted: () => void;
}

@Injectable()
export class SignUpHandler {
  #auth = inject(Auth);
  #accountStore = inject(AccountStore);
  #accountApi = inject(AccountApiService);
  #router = inject(Router);
  #screenSizeTracking = inject(ScreenSizeTrackingService);

  execute({ setError, onCompleted }: Props) {
    this.#onAuthenticated({
      onCompleted,
      onError: (msg: string) => {
        setError(msg);
        this.#auth.signOut();
      }
    });
  }

  #onAuthenticated = rxMethod<ExecutionProps>(
    pipe(
      switchMap(ctx =>
        this.#accountApi.onSignUp().pipe(
          tapResponse(
            () => this.#getUserInfo(ctx),
            () => ctx.onError('Failed to signup user')
          )
        )
      )
    )
  );

  #getUserInfo = rxMethod<ExecutionProps>(
    pipe(
      switchMap(ctx =>
        this.#accountApi.getUserInfo().pipe(
          tapResponse(
            (u: AppUser) => {
              this.#accountStore.userAuthenticated(u);
              this.#onSuccess(ctx);
            },
            () => ctx.onError('Failed to get user info')
          )
        )
      )
    )
  );

  #onSuccess = rxMethod<ExecutionProps>(
    pipe(
      withLatestFrom(this.#screenSizeTracking.deviceSize),
      tap(([ctx, screenSize]) => {
        const isMobile = screenSize < 800;

        const route = isMobile ? '/not-mobile-yet' : '/settings';
        this.#router.navigateByUrl(route);

        ctx.onCompleted();
      })
    )
  );
}

export function getScreenSize() {}
