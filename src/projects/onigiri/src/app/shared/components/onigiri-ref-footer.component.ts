import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'o-ref-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <div class="flex align-items-center justify-content-center w-full">
      <span class="o-text-secondary o-color-grey-800">Made with </span>

      <a class="logo flex no-underline align-items-center"
         href="https://onigiri.one/?utm_source=share">
        <svg version="2.0">
          <use xlink:href="#onigiri_logo_svg" />
        </svg>

        <span class="o-logo-text o-color-grey-1000">ONIGIRI</span>
      </a>
    </div>
  
  `,
  styles: [`
  :host {
    display: block;
  }

  .logo {
    height: 25px;
    margin-left: 6px;

    svg {
      max-height: 100%;
      max-width: 25px;
    }
  }
  `]
})
export class OnigiriRefFooterComponent { }