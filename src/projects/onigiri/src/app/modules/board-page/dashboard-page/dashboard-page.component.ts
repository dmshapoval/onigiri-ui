import { AsyncPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { OnigiriButtonComponent, exhaustiveCheck } from '@oni-shared';
import { Currency, Period, TRACKING, toCurrencySymbol } from '@onigiri-models';
import { CurrencySelectorComponent } from '@onigiri-shared/components/currency-selector/currency-selector.component';
import { PeriodSelectorComponent } from '@onigiri-shared/components/period-selector/period-selector.component';
import { OnigiriMoneyPipe } from '@onigiri-shared/pipes/money';
import {
  Observable,
  exhaustMap,
  map,
  pipe,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { InvoicesStore, TrackingStore } from '@onigiri-store';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsApiService } from '../../../api/reports-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  addMonths,
  addYears,
  endOfDay,
  endOfISOWeek,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfISOWeek,
  startOfMonth,
  startOfYear
} from 'date-fns';
import { constVoid } from 'fp-ts/es6/function';
import { InvoicesApiService } from '@onigiri-api';

interface ReportFilters {
  currency: Currency;
  fromDate: Date | null;
  toDate: Date | null;
}

const CURRENCY_LOCAL_STORAGE_KEY = 'dashboard_currency';

@UntilDestroy()
@Component({
  selector: 'dashboard-page',
  standalone: true,
  templateUrl: 'dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  imports: [
    OnigiriButtonComponent,
    PeriodSelectorComponent,
    ReactiveFormsModule,
    AsyncPipe,
    CurrencySelectorComponent,
    OnigiriMoneyPipe
  ]
})
export class DashboardPageComponent implements OnInit {
  #tracking = inject(TrackingStore);
  #invoices = inject(InvoicesStore);
  #router = inject(Router);
  #invoicesApi = inject(InvoicesApiService);
  #reportsApi = inject(ReportsApiService);

  paid = signal(0);
  overdue = signal(0);
  waitingForPayment = signal(0);

  isEmpty = computed(
    () => !this.paid() && !this.overdue() && !this.waitingForPayment()
  );

  currencySymbol: Observable<string>;

  filtersForm = new FormGroup({
    currency: new FormControl<Currency>(getDefaultCurrency(), {
      nonNullable: true
    }),
    period: new FormControl<Period>('this_month', { nonNullable: true })
  });

  ngOnInit() {
    const currencyInput = this.filtersForm.controls.currency;
    const currency = currencyInput.valueChanges.pipe(
      startWith(currencyInput.value),
      shareReplay(1)
    );

    this.currencySymbol = currency.pipe(map(toCurrencySymbol));

    this.#setupReportCalcualtion();

    currencyInput.valueChanges.pipe(untilDestroyed(this)).subscribe(v => {
      localStorage.setItem(CURRENCY_LOCAL_STORAGE_KEY, v);
    });
  }

  manageInvoices() {
    this.#router.navigateByUrl('/invoices');
  }

  // TODO: extract to store action and effect
  createInvoice = rxMethod<void>(
    pipe(
      exhaustMap(() =>
        this.#invoicesApi.createInvoice().pipe(
          tapResponse(invoice => {
            this.#invoices.refreshState();

            // TODO: verify
            this.#router.navigate(['./invoices', invoice.id], {
              queryParams: { rtn_to: `/dashboard` }
            });

            this.#tracking.trackEvent(TRACKING.INVOICE.CREATE);
          }, constVoid)
        )
      )
    )
  );

  #setupReportCalcualtion() {
    this.filtersForm.valueChanges
      .pipe(
        startWith(this.filtersForm.value),
        map(fv => {
          const { fromDate, toDate } = periodToDateRange(fv.period!);

          return {
            currency: fv.currency!,
            fromDate,
            toDate
          };
        }),
        switchMap(filters => {
          const { currency, fromDate, toDate } = filters;

          return this.#reportsApi
            .getDashboardReport(currency, fromDate, toDate)
            .pipe(
              tapResponse(data => {
                this.paid.set(data.paid);
                this.waitingForPayment.set(data.waiting);
                this.overdue.set(data.overdue);
              }, constVoid)
            );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

function getDefaultCurrency(): Currency {
  const saved = localStorage.getItem(
    CURRENCY_LOCAL_STORAGE_KEY
  ) as Currency | null;
  return saved || 'USD';
}

function periodToDateRange(
  period: Period
): Pick<ReportFilters, 'fromDate' | 'toDate'> {
  const now = new Date();

  switch (period) {
    case 'all_time': {
      return { fromDate: null, toDate: null };
    }
    case 'this_year': {
      return {
        fromDate: startOfYear(now),
        toDate: endOfYear(now)
      };
    }
    case 'this_month': {
      return {
        fromDate: startOfMonth(now),
        toDate: endOfMonth(now)
      };
    }
    case 'this_week': {
      return {
        fromDate: startOfISOWeek(now),
        toDate: endOfISOWeek(now)
      };
    }
    case 'last_year': {
      const base = addYears(now, -1);

      return {
        fromDate: startOfYear(base),
        toDate: endOfYear(base)
      };
    }
    case 'last_month': {
      const base = addMonths(now, -1);
      return {
        fromDate: startOfMonth(base),
        toDate: endOfMonth(base)
      };
    }
    case 'last_3_months': {
      return {
        fromDate: startOfDay(addMonths(now, -3)),
        toDate: endOfDay(now)
      };
    }
    default: {
      exhaustiveCheck(period);
      return { fromDate: null, toDate: null };
    }
  }
}
