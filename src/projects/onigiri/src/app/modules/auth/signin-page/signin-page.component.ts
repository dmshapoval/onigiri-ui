import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UntilDestroy } from '@ngneat/until-destroy';
import { exhaustMap, from, pipe } from 'rxjs';
import { RouterLink } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import isEmpty from 'lodash/isEmpty';
import { InputTextModule } from 'primeng/inputtext';
import { constVoid } from 'fp-ts/es6/function';
import { SignInHandler } from '../signin.handler';
import { AccountApiService } from '@onigiri-api';

@UntilDestroy()
@Component({
  selector: 'signin-page',
  standalone: true,
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SignInHandler],
  imports: [
    RouterLink, InputTextModule,
    ReactiveFormsModule,
  ]
})
export class SignInPageComponent {

  #authApi = inject(AccountApiService);
  #auth = inject(Auth);
  #signInHandler = inject(SignInHandler);

  authError = signal<string | null>(null);

  pendingServer = signal(false);
  signInLinkSent = signal(false);

  emailInput = new FormControl<string | null>(null, [Validators.email]);

  get emptyEmail() {
    return isEmpty(this.emailInput.value?.trim());
  }

  get invalidEmail() {
    const errors = this.emailInput.errors;
    return errors && errors['email'];
  }

  signInWithGoogle = rxMethod<void>(pipe(
    exhaustMap(() => from(signInWithPopup(this.#auth, new GoogleAuthProvider()))
      .pipe(tapResponse(
        () => this.#signInHandler.execute({
          setError: err => {
            console.error('Sign in failed. Error ', err);
            this.authError.set('Failed to perform user signin')
          },
          onCompleted: constVoid
        }),
        constVoid)
      )
    )
  ));

  signinWithEmail = rxMethod<void>(pipe(
    exhaustMap(() => {
      this.authError.set(null);
      this.pendingServer.set(true);

      const email = this.emailInput.value!;
      const completionUrl = `${window.location.origin}/arc`;

      return this.#authApi.createSignInRequest(email, completionUrl).pipe(
        tapResponse(
          () => {
            this.signInLinkSent.set(true);
            this.pendingServer.set(false);
          },
          (e: HttpErrorResponse) => {
            this.authError.set('Failed to create signin request');
            this.pendingServer.set(false);
          }
        )
      )
    })
  ));

  onStartOver() {
    this.emailInput.reset();
    this.signInLinkSent.set(false);
  }


}
