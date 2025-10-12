import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PagesApiService } from '@onee-page-editor';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  exhaustMap,
  filter,
  from,
  map,
  pipe,
  switchMap,
  take,
  tap
} from 'rxjs';
import {
  OnigiriButtonComponent,
  OnigiriIconComponent,
  isEmpty
} from '@oni-shared';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputTextModule } from 'primeng/inputtext';
import { tapResponse } from '@ngrx/operators';

import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { SignUpHandler } from '../signup.handler';
import { constVoid } from 'fp-ts/es6/function';
import { AccountApiService } from '../../services/account-api.service';

type ValidationStatus = 'pending' | 'available' | 'not_available';

@UntilDestroy()
@Component({
  selector: 'signup-page',
  standalone: true,
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
  providers: [SignUpHandler],
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    KeyFilterModule,
    RouterLink,
    OnigiriIconComponent
  ]
})
export class SignUpPageComponent implements OnInit {
  #cdr = inject(ChangeDetectorRef);
  #auth = inject(Auth);
  #accountApi = inject(AccountApiService);

  #route = inject(ActivatedRoute);
  #signUpHandler = inject(SignUpHandler);

  #pagesApi = inject(PagesApiService);

  keyInput = new FormControl<string | null>(null, [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]);

  authError = signal<string | null>(null);
  emailAuthError = signal<string | null>(null);

  validationStatus = signal<ValidationStatus>('pending');
  blockInvalidSymbols: RegExp = /[a-zA-Z0-9-_]/;

  emailInput = new FormControl<string | null>(null, [Validators.email]);

  get emptyEmail() {
    return isEmpty(this.emailInput.value?.trim());
  }

  get invalidEmail() {
    const errors = this.emailInput.errors;
    return errors && errors['email'];
  }

  pendingServer = signal(false);
  signInLinkSent = signal(false);

  features = [
    'Remarkable widgets to make your page special',
    'Blazingly fast page load',
    'SEO optimised',
    'Use your own domain'
  ];

  ngOnInit(): void {
    this.#setupPageKeyReservation();
    this.#tryGetPageKeyFromUrl();
  }

  signUpWithGoogle = rxMethod<void>(
    pipe(
      exhaustMap(() =>
        from(signInWithPopup(this.#auth, new GoogleAuthProvider())).pipe(
          tapResponse(
            () =>
              this.#signUpHandler.execute({
                pageKey: this.keyInput.value!,
                setError: err =>
                  this.authError.set('Failed to perform user signup'),
                onCompleted: constVoid
              }),
            constVoid
          )
        )
      )
    )
  );

  signupWithEmail = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        this.pendingServer.set(true);
        this.authError.set(null);
        const email = this.emailInput.value!;
        const completionUrl = `${window.location.origin}/arc`;
        const pageKey = this.keyInput.value!;

        return this.#accountApi
          .createSignUpByEmailRequest(email, completionUrl, { pageKey })
          .pipe(
            tapResponse(
              () => {
                this.signInLinkSent.set(true);
                this.pendingServer.set(false);
              },
              (e: HttpErrorResponse) => {
                this.authError.set('Failed to create signup request');
                this.pendingServer.set(false);
              }
            )
          );
      })
    )
  );

  onStartOver() {
    this.emailInput.reset();
    this.signInLinkSent.set(false);
  }

  #tryGetPageKeyFromUrl() {
    this.#route.queryParams.pipe(take(1), untilDestroyed(this)).subscribe(v => {
      const pageKey = v['pageKey'];

      if (pageKey && /^[a-zA-Z0-9-]*$/.test(pageKey)) {
        this.keyInput.setValue(pageKey);
        this.#cdr.markForCheck();
      }
    });
  }

  #setupPageKeyReservation() {
    const pageKey = this.keyInput.valueChanges.pipe(
      map(v => v?.trim().toLowerCase())
    );

    const status = this.keyInput.statusChanges;

    combineLatest({ pageKey, status })
      .pipe(
        tap(() => this.validationStatus.set('pending')),
        debounceTime(500),
        filter(v => v.status === 'VALID' && !isEmpty(v.pageKey)),
        map(v => v.pageKey!),
        switchMap(pageKey =>
          this.#pagesApi.validatePageKey(pageKey).pipe(
            tapResponse(
              success => {
                const status: ValidationStatus = success
                  ? 'available'
                  : 'not_available';
                this.validationStatus.set(status);
              },
              e => {
                this.validationStatus.set('not_available');
              }
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
