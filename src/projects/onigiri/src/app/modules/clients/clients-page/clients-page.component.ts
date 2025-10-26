import { ChangeDetectionStrategy, Component, Injector, OnInit, effect, inject, signal } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CustomersApiService } from '@onigiri-api';
import { concatMap, exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { TableModule } from 'primeng/table';
import { OnigiriButtonComponent, OnigiriIconComponent, OnigiriTemplate } from '@oni-shared';
import { EditCustomerDialogComponent } from '../edit-customer-dialog/edit-customer-dialog.component';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { LetDirective } from '@ngrx/component';
import { CustomersStore, TrackingStore } from '@onigiri-store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

import { SkeletonModule } from 'primeng/skeleton';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Customer, CustomerListItem, toCustomerListItem } from '@onigiri-models';


@UntilDestroy()
@Component({
  selector: 'clients-page',
  standalone: true,
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule, LetDirective, SkeletonModule,
    OnigiriButtonComponent, OnigiriIconComponent,
    EmptyStatePlaceholderComponent, OnigiriTemplate,
    EditCustomerDialogComponent
  ]
})
export class ClientsPageComponent implements OnInit {

  #api = inject(CustomersApiService);
  #injector = inject(Injector);
  #dialogs = inject(Dialog);
  #tracking = inject(TrackingStore);

  store = inject(CustomersStore);


  isLoading = signal(true);

  constructor() {
    this.#setupEffects();
    this.#loadClients();
  }

  ngOnInit(): void {

  }

  onCreate = rxMethod<void>(pipe(exhaustMap(() => {
    const dialog = this.#dialogs.open<Customer>(EditCustomerDialogComponent, {
      injector: this.#injector,
      data: {}
    });

    return dialog.closed.pipe(tap(created => {
      if (created) {
        this.store.customerCreated(created);
      }
    }));
  })));

  onEdit = rxMethod<string>(pipe(switchMap(customerId => {
    const dialog = this.#dialogs.open<Customer>(EditCustomerDialogComponent, {
      injector: this.#injector,
      data: { customerId }
    });

    return dialog.closed.pipe(tap(updated => {
      if (updated) {
        this.store.customerUpdated(updated);
      }
    }));
  })));


  onDelete = rxMethod<string>(pipe(
    concatMap(customerId => this.#api.deleteCustomer(customerId).pipe(
      tapResponse(
        () => this.store.customerDeleted(customerId),
        constVoid
      )
    ))
  ));

  async #loadClients() {
    if (this.store.customers().length > 0) { return; }

    this.isLoading.set(true);
    await this.store.refreshState();
    this.isLoading.set(false);
  }

  // #loadAllClients = rxMethod<void>(pipe(
  //   tap(() => this.isLoading.set(true)),
  //   switchMap(() => this.#api.getAllCustomers().pipe(
  //     tapResponse(
  //       customers => {
  //         this.clients.set(customers);
  //         this.isLoading.set(false);
  //       },
  //       () => {
  //         this.isLoading.set(false);
  //       }
  //     )
  //   ))
  // ))

  #setupEffects() {

    // TODO: restore

    // effect(() => {
    //   const trackingSource = this.store.customers().length
    //     ? 'Clients Page'
    //     : 'Clients Page: Empty State';

    //   this.#tracking.setTrackingSource(trackingSource);
    // }, { allowSignalWrites: true });

  }
}
