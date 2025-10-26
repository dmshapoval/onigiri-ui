import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';
import { ServicesApiService } from '@onigiri-api';
import { pipe, exhaustMap, switchMap, tap, concatMap } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ServicesStore, TrackingStore } from '@onigiri-store';
import {
  OnigiriButtonComponent,
  OnigiriIconComponent,
  OnigiriTemplate
} from '@oni-shared';
import { TableModule } from 'primeng/table';
import { EmptyStatePlaceholderComponent } from '@onigiri-shared/components/empty-state-placeholder/empty-state-placeholder.component';
import { EditServiceDialogComponent } from '../edit-service-dialog/edit-service-dialog.component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { constVoid } from 'fp-ts/es6/function';
import { SkeletonModule } from 'primeng/skeleton';
import { Service, ServiceListItem, toServiceListItem } from '@onigiri-models';

@UntilDestroy()
@Component({
  selector: 'app-items-page',
  standalone: true,
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriButtonComponent,
    OnigiriTemplate,
    OnigiriIconComponent,
    TableModule,
    EmptyStatePlaceholderComponent,
    SkeletonModule
  ]
})
export class ServicesPageComponent {
  #tracking = inject(TrackingStore);
  #api = inject(ServicesApiService);
  #dialogs = inject(Dialog);

  store = inject(ServicesStore);

  isLoading = signal(true);

  constructor() {
    this.#setupEffects();
    this.#loadServices();
  }

  ngOnInit(): void { }


  onCreate = rxMethod<void>(pipe(
    exhaustMap(() => {
      const dialogRef = this.#dialogs.open<Service>(EditServiceDialogComponent, {
        data: { trackingSource: 'Services Page' }
      }); 

      return dialogRef.closed.pipe(tap(
        (created) => {
          if (created) {
            this.store.serviceCreated(created);
          }
        }
      ));
    })
  ));

  onEdit = rxMethod<string>(pipe(
    switchMap(serviceId => {
      const dialogRef = this.#dialogs.open<Service>(EditServiceDialogComponent, {
        data: { serviceId }
      });

      return dialogRef.closed.pipe(tap(
        (updated) => {
          if (updated) {
            this.store.serviceUpdated(updated);
          }
        }
      ));
    })
  ));

  onDelete = rxMethod<string>(pipe(
    concatMap(serviceId =>
      this.#api.deleteService(serviceId).pipe(
        tapResponse(
          () => this.store.serviceDeleted(serviceId),
          constVoid
        ))
    ))
  );

  async #loadServices() {
    if (this.store.services().length > 0) { return; }
    this.isLoading.set(true);
    await this.store.refreshState();
    this.isLoading.set(false);
  }

  // #loadAll = rxMethod<void>(pipe(
  //   tap(() => this.isLoading.set(true)),
  //   exhaustMap(() => this.#api.getAllServices().pipe(
  //     tapResponse(
  //       services => {
  //         this.isLoading.set(false);
  //         this.allServices.set(services);
  //       },
  //       () => {
  //         this.isLoading.set(false);
  //       }
  //     )
  //   )))
  // );

  #setupEffects() {
    // effect(
    //   () => {
    //     const trackingSource = this.store.services().length
    //       ? 'Services Page'
    //       : 'Services Page: Empty State';

    //     this.#tracking.setTrackingSource(trackingSource);
    //   },
    //   { allowSignalWrites: true }
    // );
  }
}
