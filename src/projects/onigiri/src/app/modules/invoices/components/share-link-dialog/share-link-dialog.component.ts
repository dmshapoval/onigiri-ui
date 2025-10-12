import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TrackingStore } from '@onigiri-store';
import { TRACKING } from '@onigiri-models';
import { CopyLinkButtonComponent, OnigiriIconComponent } from '@oni-shared';

@Component({
  selector: 'share-link-dialog',
  standalone: true,
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OnigiriIconComponent, CopyLinkButtonComponent]
})
export class ShareLinkDialogComponent implements OnInit {

  #tracking = inject(TrackingStore);
  #dialogRef = inject(DialogRef);
  #data: any = inject(DIALOG_DATA);

  link = '';


  ngOnInit(): void {
    const data = this.#data;

    if (!data) { return; }

    this.link = data.link || '';
  }

  onLinkCopied() {
    this.#tracking.trackEvent({
      key: TRACKING.INVOICE.SHARE_LINK_COPY,
      ctx: { source: 'Invoice sharing modal' }
    });
  }

  onClose() {
    this.#dialogRef.close();
  }

}
