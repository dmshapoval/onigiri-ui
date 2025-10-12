import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'sample-project-chip',
  standalone: true,
  template: `<span>SAMPLE</span>`,
  styles: [`
  :host {
    display: inline-block;
    width: 56px;
    height: 20px;
    border-radius: var(--border-radius);
    background-color: var(--color-orange-600);
    color: var(--color-grey-1000);
    font-size: 8px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleProjectChipComponent {
}