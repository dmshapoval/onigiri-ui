import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth, signInWithCustomToken } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { tapResponse } from '@ngrx/operators';

import { switchMap, from, exhaustMap, catchError, of } from 'rxjs';
import { constVoid, pipe } from 'fp-ts/es6/function';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AccountApiService } from '../../services/account-api.service';
import { SignUpHandler } from '../signup.handler';
import { SignInHandler } from '../signin.handler';

@UntilDestroy()
@Component({
  selector: 'signin-completion-page',
  providers: [SignUpHandler, SignInHandler],
  imports: [ProgressSpinnerModule],
  standalone: true,
  templateUrl: './signin-completion-page.component.html'
})
export class SignInCompletionPageComponent implements OnInit {

  #accountsApi = inject(AccountApiService);
  #auth = inject(Auth);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  authError = signal<string | null>(null);

  #signInHandler = inject(SignInHandler);
  #signUpHandler = inject(SignUpHandler);

  get authMode() {
    return this.#route.snapshot.queryParams['am']
      || this.#route.snapshot.queryParams['oniAuthMode']  // TODO: remove
      || 'signup';
  }

  constructor() { this.#setupProcessAuthRequestHandler(); }

  ngOnInit() {

    if (this.#auth.currentUser) {
      this.#navigateToPageEditor();
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


  #navigateToPageEditor() {
    this.#router.navigateByUrl('/editor');
  }

  #processAuthRequest: (requestId: string) => void;

  #setupProcessAuthRequestHandler() {

    const onAuthRequestCompleted = rxMethod<string>(pipe(
      exhaustMap(requestId => this.#accountsApi.onSignInByLinkCompleted(requestId).pipe(
        tapResponse(
          constVoid,
          () => {
            console.warn('Failed to mark auth request as completed');
          })
      ))
    ));

    const executeFirebaseSignIn = rxMethod<{ authToken: string; requestId: string; pageKey?: string }>(pipe(
      switchMap(({ authToken, requestId, pageKey }) => from(signInWithCustomToken(this.#auth, authToken)).pipe(
        tapResponse(
          () => {
            if (this.authMode === 'signup') {

              // NOTE: if user tries to trick us 
              // TODO: handle on server side different types of requests (eg oni / onee)
              if (!pageKey) {
                this.authError.set('Invalid auth request');
                this.#auth.signOut();
                return;
              }

              this.#signUpHandler.execute({
                pageKey,
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
      exhaustMap(requestId => this.#accountsApi
        .completeAuthRequest(requestId)
        .pipe(tapResponse(
          ({ token: authToken, data }) => {
            executeFirebaseSignIn({ authToken, requestId, pageKey: data?.pageKey });
          },
          () => {
            this.authError.set('Failed to complete auth request. Please try again.');
          }
        ))
      )
    ));
  }
}

