import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  input,
  signal
} from '@angular/core';
import { exhaustiveCheck } from '../tools';
import { OnigiriButtonComponent } from './onigiri-button.component';
import { isEmpty } from 'lodash';
import { IconKey } from './onigiri-icon.component';
import { match } from 'ts-pattern';

type ButtonStatus = 'invalid' | 'not_copied' | 'copied';

@Component({
  selector: 'o-copy-link-button',
  template: `
    @if(canShow()) {
    <o-button
      [icon]="iconKey()"
      [secondary]="status() === 'copied'"
      [textButton]="status() === 'copied'"
      class="o-h-40 w-full"
      (onClick)="onCopyLink()">
      {{ buttonText() }}
    </o-button>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OnigiriButtonComponent]
})
export class CopyLinkButtonComponent {
  text = input('Copy Link');
  link = input.required<string | null>();
  icon = input<IconKey>('link');

  status = signal<ButtonStatus>('not_copied');

  canShow = computed(() => !isEmpty(this.link()));

  buttonText = computed(() => {
    const status = this.status();

    return match(status)
      .with('not_copied', () => this.text())
      .with('copied', () => this.text())
      .with('invalid', () => '')
      .exhaustive();
  });

  iconKey = computed(() => {
    const status = this.status();

    return match(status)
      .with('not_copied', () => this.icon())
      .with('copied', () => <IconKey>'check')
      .with('invalid', () => null)
      .exhaustive();
  });

  // @Input() set link(v: string) {
  //   this._link = v;
  //   if (!this._link) {
  //     this.status = 'invalid';
  //   }
  // }

  @Output() onCopied = new EventEmitter<void>();

  // private _link: string | null = null;
  // private _cdr = inject(ChangeDetectorRef);

  // status: ButtonStatus = 'not_copied';

  // get canShow() {
  //   return !!this._link;
  // }

  // get buttonText() {
  //   switch (this.status) {
  //     case 'not_copied': {
  //       return this.text();
  //     }
  //     case 'copied': {
  //       return 'Copied';
  //     }
  //     case 'invalid': {
  //       return '';
  //     };
  //     default: {
  //       exhaustiveCheck(this.status);
  //       return '';
  //     }
  //   }
  // }

  // get iconKey(): IconKey | null {
  //   switch (this.status) {
  //     case 'not_copied': {
  //       return 'link';
  //     }
  //     case 'copied': {
  //       return 'check';
  //     }
  //     case 'invalid': {
  //       return null;
  //     };
  //     default: {
  //       exhaustiveCheck(this.status);
  //       return null;
  //     }
  //   }
  // }

  onCopyLink() {
    setTimeout(() => {
      navigator.clipboard.writeText(this.link()!);
      this.onCopied.emit();
    }, 0);

    this.status.set('copied');

    setTimeout(() => this.status.set('not_copied'), 3_000);
  }
}
