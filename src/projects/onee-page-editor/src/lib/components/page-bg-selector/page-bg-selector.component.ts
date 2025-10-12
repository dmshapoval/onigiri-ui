import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { PageDataStore } from '../../page-data.store';

@Component({
  standalone: true,
  imports: [],
  selector: 'page-bg-selector',
  templateUrl: 'page-bg-selector.component.html',
  styleUrl: 'page-bg-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBackgroundSelectorComponent implements OnInit {
  pageDataStore = inject(PageDataStore);

  bgOptions = [
    '#F5F5F5',
    '#F1F3EC',
    '#F3F4F0',
    '#F0F2F4',
    '#FBFAF7',
    '#F9F5F6',
    '#F0F1F4',
    '#F9F5EB',
    '#F4F0F0',
    '#F4F0F3'
  ];

  ngOnInit() {}

  onSelectBackground(color: string) {
    this.pageDataStore.updatePageBackground({
      _type: 'custom_color',
      color
    });
  }
}
