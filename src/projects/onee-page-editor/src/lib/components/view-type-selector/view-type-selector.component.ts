import { Component, inject, OnInit } from '@angular/core';
import { OnigiriIconComponent } from '@oni-shared';
import { PageViewStore } from '../../view.store';

@Component({
  standalone: true,
  imports: [OnigiriIconComponent],
  selector: 'view-type-selector',
  styleUrl: 'view-type-selector.component.scss',
  templateUrl: 'view-type-selector.component.html'
})
export class ViewTypeSelectorComponent {
  store = inject(PageViewStore);
}
