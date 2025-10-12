import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

export type IconKey =
  | 'dashboard'
  | 'projects'
  | 'invoices'
  | 'contracts'
  | 'services'
  | 'customers'
  | 'settings'
  | 'notifications'
  | 'logout'
  | 'trash'
  | 'arrow-back'
  | 'arrow-down'
  | 'arrow-forward'
  | 'plus'
  | 'plus-rounded'
  | 'drag'
  | 'close'
  | 'solid-close'
  | 'close-rounded'
  | 'edit'
  | 'calendar'
  | 'eye'
  | 'eye-off'
  | 'download'
  | 'send'
  | 'link'
  | 'check'
  | 'solid-check'
  | 'bank'
  | 'replace'
  | 'sparkle'
  | 'upload'
  | 'puzzle'
  | 'dollar'
  | 'percent'
  | 'phone'
  | 'laptop'
  | 'more'
  | 'restore'
  | 'proposal'
  | 'contract'
  | 'title'
  | 'settings_2'
  | 'image'
  | 'text_note'
  | 'page'
  | 'circle'
  | 'circle_filled'
  | 'sm_square_tile'
  | 'md_vertical_tile'
  | 'md_horizontal_tile'
  | 'sm_horizontal_tile'
  | 'lg_square_tile'
  | 'add_text'
  | 'form'
  | 'sync_img'
  | 'copy'
  | 'paid'
  | 'card'
  | 'page_layout_left'
  | 'page_layout_right'
  | 'page_layout_bottom'
  | 'dark_theme'
  | 'light_theme'
  | 'page_bg_pattern'
  | 'appearance'
  | 'tap'
  | 'share';

@Component({
  selector: 'o-icon',
  standalone: true,
  imports: [SvgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg-icon
      class="inline-flex"
      [src]="filePath()"
      [svgStyle]="{ height: height(), width: height() }" />
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
    `
  ]
})
export class OnigiriIconComponent {
  key = input.required<IconKey>();
  height = input('16px');

  filePath = computed(() => `assets/oni-shared/icons/${this.key()}.svg`);
}
