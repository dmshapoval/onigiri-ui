import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import {
  APP_CONFIG,
  CopyLinkButtonComponent,
  OnigiriIconComponent
} from '@oni-shared';
import { PageDataStore } from '../../../page-data.store';

@Component({
  selector: 'share-page-dialog',
  standalone: true,
  templateUrl: './share-page-dialog.component.html',
  styleUrls: ['./share-page-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OnigiriIconComponent, CopyLinkButtonComponent]
})
export class SharePageDialogComponent {
  #dialogRef = inject(DialogRef);
  #pagesHostApp = inject(APP_CONFIG).pagesHostApp;

  pageData = inject(PageDataStore);

  link = computed(() => {
    return `${this.#pagesHostApp}/${this.pageData.key()}`;
  });

  onClose() {
    this.#dialogRef.close();
  }
}
