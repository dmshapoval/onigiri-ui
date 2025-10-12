import { Component, inject, signal } from '@angular/core';
import {
  Auth, GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { UntilDestroy } from '@ngneat/until-destroy';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, from, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import isEmpty from 'lodash/isEmpty';
import { HttpErrorResponse } from '@angular/common/http';
import { constVoid } from 'fp-ts/es6/function';
import { SignUpHandler } from '../signup.handler';
import { AccountApiService } from '@onigiri-api';

@UntilDestroy()
@Component({
  selector: 'signup-page',
  standalone: true,
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  providers: [SignUpHandler],
  imports: [
    RouterLink, InputTextModule,
    ReactiveFormsModule,
  ]
})
export class SignUpPageComponent {

  #auth = inject(Auth);
  #authApi = inject(AccountApiService);
  #signUpHandler = inject(SignUpHandler);

  emailInput = new FormControl<string | null>(null, [Validators.email]);

  get emptyEmail() {
    return isEmpty(this.emailInput.value?.trim());
  }

  get invalidEmail() {
    const errors = this.emailInput.errors;
    return errors && errors['email'];
  }

  authError = signal<string | null>(null);
  pendingServer = signal(false);
  signInLinkSent = signal(false);

  features = [
    'Unlimited clients and projects',
    'Invoices and online payments',
    'Proposals and contracts',
    'Operate several businesses',
    'Personalised support',
  ];


  signUpWithGoogle = rxMethod<void>(pipe(
    exhaustMap(() => from(signInWithPopup(this.#auth, new GoogleAuthProvider()))
      .pipe(tapResponse(
        () => this.#signUpHandler.execute({
          setError: err => {
            console.error('Signup failed. Error ', err);
            this.authError.set("Failed to perform user signup");
          },
          onCompleted: constVoid
        }),
        constVoid))
    )
  ));

  signupWithEmail = rxMethod<void>(pipe(
    exhaustMap(() => {
      this.pendingServer.set(true);
      this.authError.set(null);
      const email = this.emailInput.value!;
      const completionUrl = `${window.location.origin}/arc`;

      return this.#authApi.createSignUpRequest(email, completionUrl).pipe(
        tapResponse(
          () => {
            this.signInLinkSent.set(true);
            this.pendingServer.set(false);
          },
          (e: HttpErrorResponse) => {
            this.authError.set("Failed to create signup requrest");
            this.pendingServer.set(false)
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
