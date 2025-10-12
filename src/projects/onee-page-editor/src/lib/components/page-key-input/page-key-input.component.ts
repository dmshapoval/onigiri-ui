import {
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AsyncValidatorFn,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { OnigiriIconComponent } from '@oni-shared';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import {
  catchError,
  combineLatest,
  debounceTime,
  map,
  of,
  pipe,
  switchMap,
  tap,
  timer
} from 'rxjs';
import { PagesApiService } from '../../api/pages-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { animate, style, transition, trigger } from '@angular/animations';

type Status = 'pending' | 'available' | 'not_available';

export const errorBoxAnimation = trigger('errorBox', [
  transition(':enter', [
    style({ height: '0', opacity: 0.05 }),
    animate('300ms 200ms ease-in-out', style({ height: '*', opacity: 1 }))
  ]),

  transition(
    ':leave',
    animate('300ms 100ms', style({ height: '0', opacity: 0 }))
  )
]);

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KeyFilterModule,
    InputTextModule,
    OnigiriIconComponent
  ],
  selector: 'page-key-input',
  templateUrl: 'page-key-input.component.html',
  styleUrl: 'page-key-input.component.scss',
  animations: [errorBoxAnimation]
})
export class PageKeyInputComponent implements OnInit {
  #api = inject(PagesApiService);
  #destroyRef = inject(DestroyRef);

  value = model<string>('');

  status = signal<Status>('available');

  keyInput = new FormControl<string | null>(null, [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50)
  ]);

  blockInvalidSymbols: RegExp = /[a-zA-Z0-9-_]/;
  checkingAvailability = signal(false);

  constructor() {
    this.keyInput.addAsyncValidators(c =>
      timer(500).pipe(
        switchMap(() => {
          if (c.invalid) {
            return of(null);
          }

          if (c.value === this.value()) {
            return of(null);
          }

          return this.#api.validatePageKey2(c.value).pipe(
            map(_ => null),
            catchError(_ => of({ notAvailable: true }))
          );
        })
      )
    );
  }

  ngOnInit() {
    this.keyInput.setValue(this.value(), { emitEvent: false });

    combineLatest({
      value: this.keyInput.valueChanges,
      status: this.keyInput.statusChanges
    })
      .pipe(debounceTime(100), takeUntilDestroyed(this.#destroyRef))
      .subscribe(({ status, value }) => {
        if (value && value !== this.value() && status === 'VALID') {
          this.value.set(value);
        }
      });
  }

  #checkAvailability = rxMethod<string>(
    pipe(
      debounceTime(500),
      tap(() => this.status.set('pending')),
      switchMap(key => {
        return this.#api.validatePageKey2(key).pipe(
          tapResponse(
            () => {
              this.status.set('available');
              this.value.set(key);
            },
            () => {
              this.status.set('not_available');
            }
          )
        );
      })
    )
  );

  // #setupStatusPropagation() {
  //   const control = this.parentControl.control;

  //   if (!control) {
  //     console.error("Parent control not found");
  //     return;
  //   }

  //   this.keyInput.statusChanges.pipe(untilDestroyed(this)).subscribe(status => {
  //     match(status)
  //       .with("PENDING", () => {
  //         // this.validationStatus.set('pending');
  //         control.setErrors(null);
  //         control.markAsPending();
  //       })
  //       .with("INVALID", () => {
  //         // this.validationStatus.set('not_available');
  //         control.setErrors({ invalid: true });
  //       })
  //       .with("VALID", () => {
  //         // this.validationStatus.set('available');
  //         control.setErrors(null);
  //       });
  //   });
  // }

  #createValidator(): AsyncValidatorFn {
    return c =>
      timer(500).pipe(
        switchMap(() => {
          if (c.invalid) {
            return of(null);
          }

          if (c.value === this.value()) {
            return of(null);
          }

          return this.#api.validatePageKey2(c.value).pipe(
            map(_ => null),
            catchError(_ => of({ notAvailable: true }))
          );
        })
      );
  }
}
