import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { tapResponse } from "@ngrx/operators";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap } from "rxjs";
import { AccountApiService } from "../services/account-api.service";

interface Props {
  setError: (e: string) => void;
  onCompleted: () => void;
}

interface ExecutionProps {
  onError: (e: string) => void;
  onCompleted: () => void;
}

@Injectable()
export class SignInHandler {

  #auth = inject(Auth);
  #accountApi = inject(AccountApiService);
  #router = inject(Router);

  execute({ setError, onCompleted }: Props) {
    this.#onUserAuthenticated({

      onError: err => {
        setError(err);
        this.#auth.signOut();
      },

      onCompleted

    });
  }

  #onUserAuthenticated = rxMethod<ExecutionProps>(pipe(
    switchMap(ctx => this.#accountApi.getStatus().pipe(
      tapResponse(
        () => this.#checkStatus(ctx),
        (e: HttpErrorResponse) => {
          if (e.status === 404) {
            ctx.onError("Seems that there's no such user yet. You can quickly sign up \ud83d\udc47");
          } else {
            ctx.onError('Failed to authenticate user')
          }
        }
      )
    ))
  ));

  #checkStatus = rxMethod<ExecutionProps>(pipe(
    switchMap(({ onCompleted, onError }) => this.#accountApi.getStatus().pipe(
      tapResponse(
        r => {

          if (r.is_registered && r.has_page) {
            this.#router.navigateByUrl('/editor');
            onCompleted();
          } else {
            onError("Seems that user does not have page yet. You can quickly create one \ud83d\udc47")
          }
        },
        (e: HttpErrorResponse) => {
          onError("Failed to get user status. Please contact administrator");
        }
      )
    ))
  ));
}