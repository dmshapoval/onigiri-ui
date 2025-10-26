import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CustomersStore,
  ProjectsStore,
  ServicesStore,
  TrackingStore
} from '@onigiri-store';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, pipe } from 'rxjs';
import {
  exhaustMap,
  filter,
  switchMap,
  take,
  tap,
  throttleTime,
  withLatestFrom
} from 'rxjs';
import {
  Currency,
  InvoiceData,
  InvoiceStatus,
  SharedInvoiceLinkData,
  TRACKING
} from '@onigiri-models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {} from '@onigiri-store';

import { Dialog } from '@angular/cdk/dialog';

import { InvoiceEditorStore } from './invoice-editor.store';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OnigiriButtonComponent, exhaustiveCheck } from '@oni-shared';
import { DownloadInvoicePDFButtonComponent } from '../components/download-invoice-pdf-button.component';
import { InvoicesApiService } from '../../../api/invoices-api.service';
import {
  SendInvoiceDialogComponent,
  ShareLinkDialogComponent
} from '../components';
import { ProjectSelectorComponent } from '../../projects/project-selector/project-selector.component';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { SkeletonModule } from 'primeng/skeleton';
import { InvoiceStatusSelectorComponent } from './components/invoice-status-selector/invoice-status-selector.component';
import { AsyncPipe } from '@angular/common';
import { InvoiceEditFormComponent } from './components/invoice-edit-form/invoice-edit-form.component';
import { InvoiceViewComponent } from '../components/invoice-view/invoice-view.component';
import { MarkAsPaidDialogComponent } from './components/mark-as-paid-dialog/mark-as-paid-dialog.component';
import { CurrencySelectorComponent } from '@onigiri-shared/components/currency-selector/currency-selector.component';
import { constVoid } from 'fp-ts/es6/function';

@UntilDestroy()
@Component({
  selector: 'invoice-edit-page',
  standalone: true,
  templateUrl: './invoice-editor.component.html',
  styleUrls: ['./invoice-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InvoiceEditorStore],
  imports: [
    OnigiriButtonComponent,
    InvoiceEditFormComponent,
    SelectButtonModule,
    ReactiveFormsModule,
    AsyncPipe,
    InvoiceStatusSelectorComponent,
    InvoiceViewComponent,
    DownloadInvoicePDFButtonComponent,
    SkeletonModule,
    CurrencySelectorComponent
  ]
})
export class InvoiceEditorComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #invoicesApi = inject(InvoicesApiService);
  #dialogs = inject(Dialog);
  #customers = inject(CustomersStore);
  #services = inject(ServicesStore);
  #tracking = inject(TrackingStore);
  #projects = inject(ProjectsStore);

  editorStore = inject(InvoiceEditorStore);

  constructor() {
    // preload dictionaries
    // this.#customers.getAll();
    this.#projects.getAll();
    //this.#services.getAll();

    // NOTES: needed here as rxMethod uses injector
    this.#setupChangeHandlers();
    this.#setupStatusChangeHandlers();
  }

  invoiceStatusInput = new FormControl<InvoiceStatus>('draft', {
    nonNullable: true
  });
  currencyInput = new FormControl<Currency>('USD', { nonNullable: true });
  projectInput = new FormControl<string | null>(null);

  sharedInvoiceData = signal<SharedInvoiceLinkData | null>(null);

  status = toSignal(this.editorStore.status, { initialValue: 'draft' });

  isPaid = computed(() => this.status() === 'paid');
  isNotPaid = computed(() => this.status() !== 'paid');

  isLoadingPreviewData = signal(false);

  ngOnInit(): void {
    // this.#route.data
    //   .pipe(untilDestroyed(this))
    //   .subscribe(({ invoice }) => {
    //     this.editorStore.setInvoiceData(invoice);
    //   });

    this.#tracking.setTrackingSource('Invoice details');
  }

  onClose = rxMethod<void>(
    pipe(
      exhaustMap(() =>
        this.editorStore.pendingRequests.pipe(
          filter(x => x === 0),
          take(1)
        )
      ),
      tap(() => {
        const returnTo =
          this.#route.snapshot.queryParams['rtn_to'] || '/invoices';
        this.#router.navigateByUrl(returnTo);
      })
    )
  );

  showPreview = rxMethod<void>(
    pipe(
      throttleTime(200),
      switchMap(() => this.editorStore.invoiceId),
      tap(invoiceId => {
        this.#tracking.setTrackingSource(TRACKING.INVOICE.PREVIEW_REQUEST);

        this.#router.navigateByUrl(`/invoices/${invoiceId}/preview`);
      })
    )
  );

  showPublicLink = rxMethod<void>(
    pipe(
      withLatestFrom(this.editorStore.invoiceId),
      exhaustMap(([_, invoiceId]) => {
        this.#tracking.trackEvent(TRACKING.INVOICE.SHARE_LINK_REQUEST);

        return this.#invoicesApi.getPublicLink(invoiceId).pipe(
          switchMap(link => {
            const dialog = this.#dialogs.open(ShareLinkDialogComponent, {
              data: { link }
            });

            return dialog.closed;
          })
        );
      })
    )
  );

  sendEmail = rxMethod<void>(
    pipe(
      withLatestFrom(this.editorStore.invoiceId),
      exhaustMap(([_, invoiceId]) => {
        const recipient = this.editorStore.selectedCustomer()?.email || null;

        this.#tracking.trackEvent(TRACKING.INVOICE.EMAIL_REQUEST);

        const dialog = this.#dialogs.open(SendInvoiceDialogComponent, {
          width: '600px',
          data: { invoiceId, recipient }
        });

        return dialog.closed.pipe(
          tap(invoiceWasSent => {
            if (invoiceWasSent && this.status() === 'draft') {
              this.editorStore.setSentStatus();
            }
          })
        );
      }),
      tap(() => this.editorStore.refreshData())
    )
  );

  onMarkPaidRequest = rxMethod<void>(
    pipe(
      withLatestFrom(this.editorStore.status),
      exhaustMap(([_, oldStatus]) => {
        const dialogRef = this.#dialogs.open(MarkAsPaidDialogComponent, {
          width: '455px',
          height: '320px'
        });

        return dialogRef.closed.pipe(
          tap(paymentDate => {
            if (!paymentDate) {
              this.invoiceStatusInput.setValue(oldStatus, { emitEvent: false });
              return;
            }

            this.editorStore.setPaidStatus(<Date>paymentDate);
          })
        );
      })
    )
  );

  handlePDFRequest = () => {
    return this.editorStore.invoiceId.pipe(
      take(1),
      switchMap(invoiceId => this.#invoicesApi.generatePDF(invoiceId)),
      tapResponse(() => {
        this.#tracking.trackEvent(TRACKING.INVOICE.PDF_DOWNLOAD);
      }, constVoid)
    );
  };

  #setupChangeHandlers() {
    const createChangeHandler = <T>(
      changes: Observable<T>,
      handler: (x: T) => void
    ) => {
      return rxMethod<T>(tap(handler))(changes);
    };

    createChangeHandler(this.currencyInput.valueChanges, v =>
      this.editorStore.updateCurrency(v)
    );

    createChangeHandler(this.projectInput.valueChanges, v =>
      this.editorStore.updateProject(v)
    );

    const clearFormValues = () => {
      this.projectInput.setValue(null, { emitEvent: false });
      this.currencyInput.setValue('USD', { emitEvent: false });
      this.invoiceStatusInput.setValue('draft', { emitEvent: false });
    };

    const updateControlValues = (data: InvoiceData) => {
      this.projectInput.setValue(data.project, { emitEvent: false });
      this.currencyInput.setValue(data.currency, { emitEvent: false });
      this.invoiceStatusInput.setValue(data.status, { emitEvent: false });
    };

    this.editorStore.state$
      .pipe(untilDestroyed(this))
      .subscribe(state =>
        state.invoice ? updateControlValues(state.invoice) : clearFormValues()
      );
  }

  #setupStatusChangeHandlers() {
    const hideInvoicePreview = () => this.sharedInvoiceData.set(null);

    const showInvoicePreview = rxMethod<void>(
      pipe(
        withLatestFrom(this.editorStore.invoiceId),
        tap(() => this.isLoadingPreviewData.set(true)),
        switchMap(([_, invoiceId]) =>
          this.#invoicesApi.getSharedInvoiceData(invoiceId).pipe(
            tapResponse(
              data => {
                this.sharedInvoiceData.set(data);
                this.isLoadingPreviewData.set(false);
              },
              () => {
                console.error('Failed to get invoice preview data');
                this.sharedInvoiceData.set(null);
                this.isLoadingPreviewData.set(false);
              }
            )
          )
        )
      )
    );

    // status propagation
    this.invoiceStatusInput.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(v => {
        switch (v) {
          case 'draft': {
            hideInvoicePreview();
            this.editorStore.setDraftStatus();
            return;
          }
          case 'sent': {
            hideInvoicePreview();
            this.editorStore.setSentStatus();
            return;
          }
          case 'paid': {
            this.onMarkPaidRequest();
            return;
          }
          case 'overdue': {
            hideInvoicePreview();
            this.editorStore.setOverdueStatus();
            return;
          }
          default: {
            exhaustiveCheck(v);
          }
        }
      });

    // UI behavior
    effect(
      () => {
        const isPaid = this.isPaid();

        if (isPaid) {
          this.currencyInput.disable({ emitEvent: false });
          showInvoicePreview();
        } else {
          this.currencyInput.enable({ emitEvent: false });
          hideInvoicePreview();
        }
      },
      { allowSignalWrites: true }
    );
  }
}
