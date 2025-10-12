import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  OneePageEditorComponent,
  setUserHasOneePageCookie,
} from '@onee-page-editor';
import { OnigiriButtonComponent, OnigiriTemplate } from '@oni-shared';

@Component({
  selector: 'link-in-bio-page-editor-page',
  standalone: true,
  templateUrl: 'link-in-bio-page-editor-page.component.html',
  styleUrl: './link-in-bio-page-editor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OneePageEditorComponent, OnigiriTemplate, OnigiriButtonComponent],
})
export class LinkInBioPageEditorPageComponent implements OnInit {
  #router = inject(Router);

  ngOnInit() {
    setUserHasOneePageCookie();
  }

  onClose() {
    this.#router.navigateByUrl('/settings');
  }
}
