import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PagesApiService } from '@onee-page-editor';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { AccountApiService } from '../services/account-api.service';

interface Props {
  pageKey: string;
  setError: (e: string) => void;
  onCompleted: () => void;
}

interface ExecutionProps {
  pageKey: string;
  onError(err: string): void;
  onCompleted: () => void;
}

@Injectable()
export class SignUpHandler {
  #auth = inject(Auth);
  #pagesApi = inject(PagesApiService);
  #accountApi = inject(AccountApiService);
  #router = inject(Router);

  execute({ setError, onCompleted, pageKey }: Props) {
    this.#onUserAuthenticated({
      pageKey,
      onCompleted,
      onError: (msg: string) => {
        console.error('Error while signup handler execution');
        console.error(msg);

        setError(msg);
        this.#auth.signOut();
      }
    });
  }

  #onUserAuthenticated = rxMethod<ExecutionProps>(
    pipe(
      switchMap(ctx =>
        this.#accountApi.signupUser().pipe(
          tapResponse(
            () => {
              console.log('User signup completed');
              this.#getStatus(ctx);
            },
            () => ctx.onError('Failed to authenticate user')
          )
        )
      )
    )
  );

  #getStatus = rxMethod<ExecutionProps>(
    pipe(
      switchMap(ctx =>
        this.#accountApi.getStatus().pipe(
          tapResponse(
            r => {
              console.log('User status check result', r);

              if (r.has_page) {
                this.#router.navigateByUrl('/editor');
                ctx.onCompleted();
              } else {
                this.#createUserPage(ctx);
              }
            },
            () => {
              ctx.onError(
                'Failed to get user status. Please contact administrator'
              );
            }
          )
        )
      )
    )
  );

  #createUserPage = rxMethod<ExecutionProps>(
    pipe(
      switchMap(({ onError, onCompleted, pageKey }) =>
        this.#pagesApi.createPage(pageKey).pipe(
          tapResponse(
            () => {
              console.log('User page created');
              this.#router.navigateByUrl('/editor/onboarding');
              onCompleted();
            },
            () => {
              onError('Failed to create page');
            }
          )
        )
      )
    )
  );
}
