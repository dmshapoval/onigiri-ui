import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { exhaustMap, pipe } from 'rxjs';
import { RequestStatus } from '@onigiri-models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { EMAIL_REGEX, OnigiriIconComponent, isNotNil } from '@oni-shared';
import { SendInvoiceButtonComponent } from './send-invoice-button.component';
import { Chips, ChipsModule } from 'primeng/chips';
import { InputTextModule } from 'primeng/inputtext';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { HttpErrorResponse } from '@angular/common/http';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InvoicesApiService } from '@onigiri-api';

@UntilDestroy()
@Component({
  selector: 'send-invoice-dialog',
  standalone: true,
  templateUrl: './send-invoice-dialog.component.html',
  styleUrls: ['./send-invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    OnigiriIconComponent,
    InputTextModule,
    InputTextareaModule,
    SendInvoiceButtonComponent,
    ChipsModule
  ]
})
export class SendInvoiceDialogComponent implements OnInit {
  #dialogRef = inject(DialogRef);
  #data: any = inject(DIALOG_DATA);
  #invoicesApi = inject(InvoicesApiService);

  requestStatus = signal<RequestStatus>('not_started');

  serverError = signal<string | null>('');
  invoiceWasSent = signal(false);
  emailIsNotValid = signal(false);

  emailsSeparatorExp: RegExp = /,| /;

  #invoiceId: string | null = null;

  form = new FormGroup({
    recipients: new FormControl<string[] | null>(null, {
      validators: [
        Validators.required,
        Validators.minLength(1),
        multiEmailValidator
      ]
    }),
    cc: new FormControl<string[] | null>(null, {
      validators: [multiEmailValidator]
    }),
    message: new FormControl<string | null>(null)
  });

  canSend = computed(
    () => this.requestStatus() === 'not_started' && isNotNil(this.#invoiceId)
  );

  ngOnInit(): void {
    const data = this.#data;

    if (!data) {
      return;
    }

    this.#invoiceId = data.invoiceId || null;

    if (data.recipient) {
      this.form.patchValue({
        recipients: [data.recipient]
      });
    }

    this.form.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this._cleanServerError());
  }

  onSend = rxMethod<void>(
    exhaustMap(() => {
      this.requestStatus.set('running');
      this.serverError.set(null);

      const fv = this.form.getRawValue();
      const recepients = fv.recipients!;
      const cc = fv.cc || [];

      return this.#invoicesApi
        .sendInvoice(this.#invoiceId!, recepients, cc, fv.message)
        .pipe(
          tapResponse(
            () => {
              this.requestStatus.set('completed');
              this.invoiceWasSent.set(true);
            },
            () => {
              this.requestStatus.set('failed');

              this.serverError.set(
                "Something went wrong and we weren't able to send an email. Try again or contact us if the error will happen longer"
              );

              setTimeout(() => {
                this.requestStatus.set('not_started');
              }, 1000);
            }
          )
        );
    })
  );

  isNotValidEmail(value: string | null) {
    return value && !EMAIL_REGEX.test(value);
  }

  onClose() {
    this.#dialogRef.close(this.invoiceWasSent());
  }

  private _cleanServerError() {
    this.serverError.set('');
  }
}

const multiEmailValidator: ValidatorFn = function (control: AbstractControl) {
  const value: string[] | null = control.value;

  if (value?.length) {
    const allValid = value.every(x => EMAIL_REGEX.test(x));
    if (!allValid) {
      return { email: true };
    }
  }

  return null;
};
