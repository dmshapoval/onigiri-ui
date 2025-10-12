import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MobileEditorCloseDirective } from '../../../directives';
import { PageBackgroundSelectorComponent } from '../../../components';

@Component({
  standalone: true,
  imports: [PageBackgroundSelectorComponent, MobileEditorCloseDirective],
  selector: 'appearance-mobile-editor',
  templateUrl: 'appearance-editor.component.html',
  styleUrl: 'appearance-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppearanceMobileEditorComponent implements OnInit {
  ngOnInit() {}
}
