import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { OnigiriButtonComponent, CopyLinkButtonComponent, OnigiriIconComponent } from '@oni-shared';


@Component({
  selector: 'edit-payment-details-dialog',
  standalone: true,
  templateUrl: './payment-details-dialog.component.html',
  styleUrl: './payment-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnigiriIconComponent, OnigiriButtonComponent,
    CopyLinkButtonComponent
  ]
})
export class PaymentDetailsDialogComponent {

  #dialogRef = inject(DialogRef);
  data: { details: string } = inject(DIALOG_DATA);


  onCopy() {

  }

  onCancel() {
    this.#dialogRef.close();
  }

}
