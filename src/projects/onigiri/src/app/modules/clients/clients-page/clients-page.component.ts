import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  effect,
  inject,
  signal
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CustomersApiService } from '@onigiri-api';
import { pipe, switchMap } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { TableModule } from 'primeng/table';
import {
  OnigiriButtonComponent,
  OnigiriIconComponent,
  OnigiriTemplate
} from '@oni-shared';
import { EditCustomerDialogComponent } from '../edit-customer-dialog/edit-customer-dialog.component';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { LetDirective } from '@ngrx/component';
import { CustomersStore, TrackingStore } from '@onigiri-store';
import { ClientCardComponent } from '../client-card/client-card.component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';

import { SkeletonModule } from 'primeng/skeleton';
import { Customer } from '@onigiri-models';

@UntilDestroy()
@Component({
  selector: 'clients-page',
  standalone: true,
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    LetDirective,
    SkeletonModule,
    OnigiriButtonComponent,
    OnigiriIconComponent,
    EmptyStatePlaceholderComponent,
    OnigiriTemplate,
    EditCustomerDialogComponent,
    ClientCardComponent
  ]
})
export class ClientsPageComponent implements OnInit {
  #api = inject(CustomersApiService);
  #injector = inject(Injector);
  #dialogs = inject(Dialog);
  #tracking = inject(TrackingStore);

  store = inject(CustomersStore);

  isLoading = signal(true);
  selectedCustomer = signal<Customer | null>(null);

  constructor() {
    this.#setupEffects();

    this.store.getAll(() => this.isLoading.set(false));
  }

  ngOnInit(): void {}

  onCreate() {
    this.#dialogs.open(EditCustomerDialogComponent, {
      injector: this.#injector,
      data: {}
    });
  }

  onEdit(customerId: string) {
    this.#dialogs.open(EditCustomerDialogComponent, {
      data: { customerId }
    });
  }

  onDelete = rxMethod<string>(
    pipe(
      switchMap(customerId =>
        this.#api
          .deleteCustomer(customerId)
          .pipe(
            tapResponse(() => this.store.customerDeleted(customerId), constVoid)
          )
      )
    )
  );

  openMobileMenu(customer: any) {
    this.selectedCustomer.set(customer);
  }

  closeMobileMenu() {
    this.selectedCustomer.set(null);
  }

  onDeleteMobile() {
    if (this.selectedCustomer()) {
      this.onDelete(this.selectedCustomer()!.id);
      this.closeMobileMenu();
    }
  }

  onEditMobile() {
    if (this.selectedCustomer()) {
      this.onEdit(this.selectedCustomer()!.id);
      this.closeMobileMenu();
    }
  }

  #setupEffects() {
    effect(
      () => {
        const trackingSource = this.store.customers().length
          ? 'Clients Page'
          : 'Clients Page: Empty State';

        this.#tracking.setTrackingSource(trackingSource);
      },
      { allowSignalWrites: true }
    );
  }
}
