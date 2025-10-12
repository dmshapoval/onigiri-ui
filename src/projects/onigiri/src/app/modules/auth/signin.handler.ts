import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { AccountApiService } from "@onigiri-api";
import { AppUser } from "@onigiri-models";
import { AccountStore } from "@onigiri-store";
import { pipe, switchMap } from "rxjs";

interface Props {
  setError: (e: string) => void;
  onCompleted: () => void;
}

interface ExecutionProps {
  onNotFound: () => void;
  onError: (e: string) => void;
  onCompleted: () => void;
}

@Injectable()
export class SignInHandler {

  #auth = inject(Auth);
  #accountStore = inject(AccountStore);
  #accountApi = inject(AccountApiService);
  #router = inject(Router);

  execute({ setError, onCompleted }: Props) {
    this.#onAuthenticated({

      onError: err => {
        setError(err);
        this.#auth.signOut();
      },

      onNotFound: () => {
        setError("Seems that there's no such user yet. You can quickly sign up \ud83d\udc47");
        this.#auth.signOut();
      },

      onCompleted

    });
  }

  #onAuthenticated = rxMethod<ExecutionProps>(pipe(
    switchMap(ctx => this.#accountApi.onSignIn().pipe(
      tapResponse(
        () => this.#getUserInfo(ctx),
        (e: HttpErrorResponse) => {
          if ([401, 403, 404].includes(e.status)) {
            ctx.onNotFound();
          } else {
            ctx.onError('Failed to authenticate user')
          }
        }
      )
    ))
  ));

  #getUserInfo = rxMethod<ExecutionProps>(pipe(
    switchMap(({ onError, onCompleted }) => this.#accountApi.getUserInfo().pipe(
      tapResponse(
        (u: AppUser) => {
          this.#accountStore.userAuthenticated(u);
          this.#router.navigateByUrl('/invoices');
          onCompleted();
        },
        () => onError('Failed to get user info')
      )
    ))
  ));
}