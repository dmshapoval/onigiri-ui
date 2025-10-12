import { HttpClient } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { APP_CONFIG } from '../../../../config';
import { isNotNil } from '@oni-shared';
import { tapResponse } from '@ngrx/operators';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DatePipe, JsonPipe, Location } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { OnigiriSubscriptionDto } from 'projects/onigiri-admin/src/app/api';

@Component({
  standalone: true,
  imports: [
    TableModule, ButtonModule,
    AccordionModule, DatePipe,
    JsonPipe, SkeletonModule
  ],
  selector: 'user-details-page',
  templateUrl: 'user-details-page.component.html'
})
export class UserDetailsPageComponent implements OnInit {

  #http = inject(HttpClient);
  #appConfig = inject(APP_CONFIG);
  #messages = inject(MessageService);
  location = inject(Location);


  userId = input<string>();
  loading = signal(false);
  data = signal<UserDetails | null>(null);

  constructor() {
    this.#loadData(this.userId);
  }

  ngOnInit() { }

  copyUrl(url: string) {
    setTimeout(() => {
      navigator.clipboard.writeText(url);
    }, 0);
  }

  #loadData = rxMethod<string | undefined>(pipe(
    filter(isNotNil),
    tap(() => this.loading.set(true)),
    switchMap(userId => {
      return this.#http.get<UserDetails>(`${this.#appConfig.urls.onigiri}/api/oi/sa/users/${userId}`).pipe(
        tapResponse(
          r => {
            this.data.set(r);
            this.loading.set(false);
          },
          e => {
            this.#messages.add({
              severity: 'error',
              summary: 'Failed to get user data',
            });
            this.loading.set(false);
          }
        )
      );
    })
  ))
}

interface UserDetails {
  email: string | null;
  subscription: OnigiriSubscriptionDto;
  invoices: {
    no: string | null;
    amount: number;
    date: string | null;
    currency: string;
    publicLink: string | null;
  }[]
}