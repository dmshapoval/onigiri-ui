import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { APP_CONFIG } from '../../../../config';
import { addDays } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { tapResponse } from '@ngrx/operators';

import { ButtonModule } from 'primeng/button';
import {
  BillingInterval,
  EnterpriseSubscriptionStatus,
  OnigiriSubscriptionDto
} from '../../../../../app/api';
import { match } from 'ts-pattern';
import { constVoid } from 'fp-ts/es6/function';
type LoadingStatus = 'pending' | 'success' | 'failed';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CalendarModule,
    SkeletonModule,
    DropdownModule,
    ButtonModule
  ],
  selector: 'edit-user-subscription-dialog',
  templateUrl: 'edit-user-subscription-dialog.component.html'
})
export class EditUserSubscriptionDialogComponent implements OnInit {
  #config = inject(DynamicDialogConfig);
  #dialogRef = inject(DynamicDialogRef);
  #http = inject(HttpClient);
  #appConfig = inject(APP_CONFIG);

  userId = signal<string | null>(null);
  loadingStatus = signal<LoadingStatus>('pending');

  oniSubscriptionType = new FormControl<OnigiriSubscriptionDto['type']>(
    'trial'
  );

  oniTrialForm = new FormGroup({
    startsAt: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: Validators.required
    }),
    expiresAt: new FormControl<Date>(addDays(new Date(), 13), {
      nonNullable: true,
      validators: Validators.required
    })
  });

  oniEnterpiseForm = new FormGroup({
    startsAt: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: Validators.required
    }),
    expiresAt: new FormControl<Date>(addDays(new Date(), 13), {
      nonNullable: true,
      validators: Validators.required
    }),
    billingInterval: new FormControl<BillingInterval>('year', {
      nonNullable: true
    }),
    status: new FormControl<EnterpriseSubscriptionStatus>('active', {
      nonNullable: true
    })
  });

  oniSubscriptionOptions = [
    {
      name: 'Trial',
      value: 'trial'
    },
    {
      name: 'Growing business',
      value: 'enterprise'
    }
  ];

  billingIntervalOptions = [
    {
      name: 'Month',
      value: 'month'
    },
    {
      name: 'Year',
      value: 'year'
    }
  ];

  subscStatusOptions = [
    {
      name: 'Active',
      value: 'active'
    },
    {
      name: 'Canceled',
      value: 'canceled'
    },
    {
      name: 'Past due',
      value: 'past_due'
    },
    {
      name: 'Paused',
      value: 'paused'
    }
  ];

  constructor() {
    this.#setupDataLoad();
  }

  ngOnInit() {
    const userId = this.#config.data.userId;
    this.userId.set(userId || null);
  }

  onSave = rxMethod<void>(
    pipe(
      exhaustMap(() => {
        const userId = this.userId();
        const type = this.oniSubscriptionType.value!;
        const payload = match(type)
          .with('trial', () => {
            const fv = this.oniTrialForm.getRawValue();
            return {
              type: 'trial',
              starts_at: fv.startsAt.getTime(),
              expires_at: fv.expiresAt.getTime()
            };
          })
          .with('enterprise', () => {
            const fv = this.oniEnterpiseForm.getRawValue();
            return {
              type: 'enterprise',
              starts_at: fv.startsAt.getTime(),
              expires_at: fv.expiresAt.getTime(),
              status: fv.status,
              billing_interval: fv.billingInterval
            };
          })
          .exhaustive();

        return this.#http
          .patch(
            `${
              this.#appConfig.urls.onigiri
            }/api/oi/sa/users/${userId}/subscription`,
            payload
          )
          .pipe(tapResponse(() => this.#dialogRef.close(true), constVoid));
      })
    )
  );

  onCancel() {
    this.#dialogRef.close(false);
  }

  #handleUserSubscriptionsInfo(onigiri: OnigiriSubscriptionDto) {
    this.oniSubscriptionType.setValue(onigiri.type);

    this.oniTrialForm.patchValue({
      startsAt: new Date(onigiri.starts_at),
      expiresAt: new Date(onigiri.expires_at)
    });

    this.oniEnterpiseForm.patchValue({
      startsAt: new Date(onigiri.starts_at),
      expiresAt: new Date(onigiri.expires_at)
    });

    if (onigiri.type === 'enterprise') {
      this.oniEnterpiseForm.patchValue({
        billingInterval: onigiri.billing_interval,
        status: onigiri.status
      });
    }
  }

  #setupDataLoad() {
    const loadData = rxMethod<string>(
      pipe(
        tap(() => this.loadingStatus.set('pending')),
        switchMap(userId =>
          this.#http
            .get<OnigiriSubscriptionDto>(
              `${
                this.#appConfig.urls.onigiri
              }/api/oi/sa/users/${userId}/subscription`
            )
            .pipe(
              tapResponse(
                data => {
                  this.#handleUserSubscriptionsInfo(data);
                  this.loadingStatus.set('success');
                },
                () => this.loadingStatus.set('failed')
              )
            )
        )
      )
    );

    effect(() => {
      const userId = this.userId();
      if (!userId) {
        return;
      }

      untracked(() => {
        loadData(userId);
      });
    });
  }
}
