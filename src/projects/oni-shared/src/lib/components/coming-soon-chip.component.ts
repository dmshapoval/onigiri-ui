import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'coming-soon-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="comming-soon">{{text}}</span>`,
  styles: [`

    :host { 
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--color-yellow-400);
      width: 100px;
      height: 20px;
      border-radius: 20px;
    }

    .comming-soon {
      color: var(--color-grey-1000);
      font-size: 8px;
      font-weight: 700;
    }
    
  `]
})
export class ComingSoonChipComponent {
  @Input() text = 'COMING SOON';
}
