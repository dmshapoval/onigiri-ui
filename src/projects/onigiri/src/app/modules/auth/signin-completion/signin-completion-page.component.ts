import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth, signInWithCustomToken } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, exhaustMap, from, of, pipe, switchMap } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { SignUpHandler } from '../signup.handler';
import { SignInHandler } from '../signin.handler';
import { AccountApiService } from '@onigiri-api';
import { constVoid } from 'fp-ts/es6/function';

type AuthMode = 'signin' | 'signup';

@UntilDestroy()
@Component({
  selector: 'signin-completion-page',
  standalone: true,
  imports: [ProgressSpinnerModule],
  providers: [SignUpHandler, SignInHandler],
  templateUrl: './signin-completion-page.component.html'
})
export class SignInCompletionPageComponent implements OnInit {

  #authApi = inject(AccountApiService);

  #auth = inject(Auth);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  #signInHandler = inject(SignInHandler);
  #signUpHandler = inject(SignUpHandler);

  authError = signal<string | null>(null);

  get authMode(): AuthMode {
    return this.#route.snapshot.queryParams['am']
      || this.#route.snapshot.queryParams['oniAuthMode'] // TODO: remove
      || 'signup';
  }

  constructor() {
    this.#setupProcessAuthRequestHandler();
  }

  ngOnInit() {

    if (this.#auth.currentUser) {
      this.#router.navigateByUrl('/invoices');
      return;
    }

    const requestId = this.#route.snapshot.queryParams['aid']
      || this.#route.snapshot.queryParams['oniAuthRequestId']; // TODO: remove

    if (!requestId) {
      this.onStartOver();
      return;
    }

    this.#processAuthRequest(requestId);
  }

  onStartOver() {
    const route = this.authMode === 'signin' ? '/signin' : '/signup';
    this.#router.navigateByUrl(route)
  }

  #processAuthRequest: (requestId: string) => void;

  #setupProcessAuthRequestHandler() {

    const onAuthRequestCompleted = rxMethod<string>(pipe(
      exhaustMap(requestId => this.#authApi.onSignInByLinkCompleted(requestId).pipe(
        tapResponse(
          constVoid,
          () => {
            console.warn('Failed to mark auth request as completed');
          }
        )
      ))
    ))

    const executeFirebaseSignIn = rxMethod<{ authToken: string; requestId: string; }>(pipe(
      switchMap(({ authToken, requestId }) => from(signInWithCustomToken(this.#auth, authToken)).pipe(
        tapResponse(
          () => {
            if (this.authMode === 'signup') {

              this.#signUpHandler.execute({
                setError: err => this.authError.set(err),
                onCompleted: () => onAuthRequestCompleted(requestId)
              });

            } else {

              this.#signInHandler.execute({
                setError: err => this.authError.set(err),
                onCompleted: () => onAuthRequestCompleted(requestId)
              });
            }
          },
          () => {
            this.authError.set('Failed to authenticate user with custom token');
            this.#auth.signOut();
          }
        )
      ))
    ));


    this.#processAuthRequest = rxMethod<string>(pipe(
      exhaustMap(requestId => this.#authApi
        .completeAuthRequest(requestId)
        .pipe(tapResponse(
          ({ token: authToken }) => executeFirebaseSignIn({ authToken, requestId }),
          () => {
            this.authError.set('Failed to complete auth request. Please try again.');
          }
        ))
      )
    ))
  }
}

interface AuthRequestCompleteResultDto {
  token: string;
}