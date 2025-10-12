import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MobileEditorCloseDirective } from '../../../directives';
import { APP_CONFIG, OnigiriIconComponent } from '@oni-shared';
import { PageDataStore } from '../../../page-data.store';

type ButtonStatus = 'not_copied' | 'copied';

@Component({
  standalone: true,
  imports: [MobileEditorCloseDirective, OnigiriIconComponent],
  selector: 'share-page-dialog-mobile-panel',
  templateUrl: 'share-page-mobile-panel.component.html',
  styleUrl: 'share-page-mobile-panel.component.scss'
})
export class SharePageMobilePanelComponent implements OnInit {
  #pagesHostApp = inject(APP_CONFIG).pagesHostApp;

  pageData = inject(PageDataStore);

  copyLinkStatus = signal<ButtonStatus>('not_copied');

  link = computed(() => {
    return `${this.#pagesHostApp}/${this.pageData.key()}`;
  });

  // iconKey = computed(() => {
  //     const status = this.status();

  //     return match(status)
  //       .with('not_copied', () => this.icon())
  //       .with('copied', () => <IconKey>'check')
  //       .with('invalid', () => null)
  //       .exhaustive();
  //   });

  ngOnInit() {}

  onCopyLink() {
    setTimeout(() => {
      navigator.clipboard.writeText(this.link()!);
    }, 0);

    this.copyLinkStatus.set('copied');

    setTimeout(() => this.copyLinkStatus.set('not_copied'), 3_000);
  }
}
