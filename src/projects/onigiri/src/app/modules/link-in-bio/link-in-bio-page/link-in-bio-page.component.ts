import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isEmpty from 'lodash/isEmpty';
import {
  combineLatest,
  debounceTime,
  exhaustMap,
  filter,
  map,
  pipe,
  switchMap,
  tap
} from 'rxjs';
import { constVoid } from 'fp-ts/es6/function';
import {
  OnigiriButtonComponent,
  OnigiriIconComponent,
  OnigiriTemplate
} from '@oni-shared';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PagesApiService, setUserHasOneePageCookie } from '@onee-page-editor';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { InputTextModule } from 'primeng/inputtext';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { OneePagesApiService } from '@onigiri-api';
import { tapResponse } from '@ngrx/operators';

type ValidationStatus = 'pending' | 'available' | 'not_available';

@UntilDestroy()
@Component({
  selector: 'link-in-bio-page',
  standalone: true,
  templateUrl: 'link-in-bio-page.component.html',
  styleUrls: ['./link-in-bio-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStatePlaceholderComponent,
    ReactiveFormsModule,
    KeyFilterModule,
    OnigiriIconComponent,
    OnigiriButtonComponent,
    OnigiriTemplate,
    InputTextModule
  ]
})
export class LinkInBioPageComponent implements OnInit {
  #router = inject(Router);
  #api = inject(PagesApiService);
  #oneeApi = inject(OneePagesApiService);

  keyInput = new FormControl<string | null>(null, [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]);

  validationStatus = signal<ValidationStatus>('pending');
  blockInvalidSymbols: RegExp = /[a-zA-Z0-9-_]/;

  pageSetupError = signal<boolean>(false);

  constructor() {
    this.#setupCreateHandler();
  }

  ngOnInit() {
    // TODO: refactor with signals and effects
    combineLatest({
      pageKey: this.keyInput.valueChanges.pipe(
        map(v => v?.trim().toLowerCase())
      ),
      status: this.keyInput.statusChanges
    })
      .pipe(
        tap(() => this.validationStatus.set('pending')),
        debounceTime(500),
        filter(v => v.status === 'VALID' && !isEmpty(v.pageKey)),
        map(v => v.pageKey!),
        switchMap(pageKey => {
          return this.#api.validatePageKey(pageKey).pipe(
            tapResponse(
              success => {
                this.validationStatus.set(
                  success ? 'available' : 'not_available'
                );
              },
              () => {
                this.validationStatus.set('not_available');
              }
            )
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();

    setUserHasOneePageCookie();
  }

  onCreate = constVoid;

  #setupCreateHandler() {
    const createOneePage = rxMethod<string>(
      pipe(
        exhaustMap(pageKey =>
          this.#api.createPage(pageKey).pipe(
            tapResponse(
              () => {
                console.log('Onee page created');
                this.#router.navigateByUrl('/page/onboarding');
              },
              () => {
                console.error('Failed to create page');
                this.pageSetupError.set(true);
              }
            )
          )
        )
      )
    );

    this.onCreate = rxMethod<void>(
      exhaustMap(() => {
        const pageKey = this.keyInput.value!;

        return this.#oneeApi.signupUser().pipe(
          tapResponse(
            () => createOneePage(pageKey),
            () => {
              console.error('Failed to register onee user');
              this.pageSetupError.set(true);
            }
          )
        );
      })
    );
  }
}
