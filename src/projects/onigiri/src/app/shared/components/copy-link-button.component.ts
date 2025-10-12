import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { OnigiriButtonComponent, exhaustiveCheck } from '@oni-shared';
import { IconKey } from '@onigiri-models';

type ButtonStatus = 'invalid' | 'not_copied' | 'copied'

@Component({
  selector: 'o-copy-link-button',
  template: `

  @if(canShow) { 
    <o-button class="o-h-40"
              [icon]="iconKey"
              [secondary]="status === 'copied'"
              [textButton]="status === 'copied'"               
              (onClick)="onCopyLink()">
    {{ buttonText }}
  </o-button>
    
  }
  `,
  standalone: true,
  imports: [
    OnigiriButtonComponent
  ],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyLinkButtonComponent {

  @Input() set link(v: string) {
    this._link = v;
    if (!this._link) {
      this.status = 'invalid';
    }
  }

  @Output() onCopied = new EventEmitter<void>();

  private _link: string | null;
  private _cdr = inject(ChangeDetectorRef);

  status: ButtonStatus = 'not_copied';

  get canShow() {
    return !!this._link;
  }

  get buttonText() {
    switch (this.status) {
      case 'not_copied': {
        return 'Copy Link';
      }
      case 'copied': {
        return 'Copied';
      }
      case 'invalid': {
        return '';
      };
      default: {
        exhaustiveCheck(this.status);
        return '';
      }
    }
  }

  get iconKey(): IconKey | null {
    switch (this.status) {
      case 'not_copied': {
        return 'link';
      }
      case 'copied': {
        return 'check';
      }
      case 'invalid': {
        return null;
      };
      default: {
        exhaustiveCheck(this.status);
        return null;
      }
    }
  }

  onCopyLink() {

    if (!this._link) return;

    setTimeout(async () => {
      navigator.clipboard.writeText(this._link!);
      this.onCopied.emit();
    }, 0);

    this.status = 'copied';

    setTimeout(() => {
      this.status = 'not_copied';
      this._cdr.markForCheck();
    }, 3_000);
  }
}
