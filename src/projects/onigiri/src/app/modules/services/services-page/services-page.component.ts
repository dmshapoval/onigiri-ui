import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal
} from '@angular/core';
import { ServicesApiService } from '@onigiri-api';
import { pipe, exhaustMap } from 'rxjs';
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
import { ServiceCardComponent } from '../service-card/service-card.component';

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
    SkeletonModule,
    ServiceCardComponent
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
    this.store.getAll(() => this.isLoading.set(false));
  }

  ngOnInit(): void {}

  onCreate() {
    this.#dialogs.open(EditServiceDialogComponent, {
      data: { trackingSource: 'Services page' }
    });
  }

  onEdit(serviceId: string) {
    this.#dialogs.open(EditServiceDialogComponent, {
      data: { serviceId }
    });
  }

  onDelete = rxMethod<string>(
    pipe(
      exhaustMap(serviceId =>
        this.#api
          .deleteService(serviceId)
          .pipe(
            tapResponse(() => this.store.serviceDeleted(serviceId), constVoid)
          )
      )
    )
  );

  #setupEffects() {
    effect(
      () => {
        const trackingSource = this.store.services().length
          ? 'Services Page'
          : 'Services Page: Empty State';

        this.#tracking.setTrackingSource(trackingSource);
      },
      { allowSignalWrites: true }
    );
  }
}
