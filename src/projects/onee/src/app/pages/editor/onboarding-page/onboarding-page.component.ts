import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingFormHost } from '@onee-page-editor';

@Component({
  standalone: true,
  selector: 'onboarding-page',
  templateUrl: 'onboarding-page.component.html',
  styleUrl: 'onboarding-page.component.scss',
  imports: [OnboardingFormHost],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingPageComponent implements OnInit {
  #router = inject(Router);

  ngOnInit() {}

  onDone() {
    this.#router.navigateByUrl('/editor');
  }
}
