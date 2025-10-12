import { Routes } from '@angular/router';
import { LinkInBioPageEditorPageComponent } from './link-in-bio-page-editor-page/link-in-bio-page-editor-page.component';
import { hasNoPageGuard } from './guards';
import { LinkInBioPageComponent } from './link-in-bio-page/link-in-bio-page.component';
import { OnboardingPageComponent } from './onboarding-page/onboarding-page.component';

export const LINK_IN_BIO_ROUTES: Routes = [
  {
    path: 'onboarding',
    component: OnboardingPageComponent,
    title: 'Onigiri: Page Editor',
    data: {
      hideNav: true,
      preloadAction: []
    }
  },
  {
    path: 'edit',
    component: LinkInBioPageEditorPageComponent,
    title: 'Onigiri: Page Editor',
    data: {
      hideNav: true,
      preloadAction: []
    }
  },
  {
    path: '',
    component: LinkInBioPageComponent,
    title: 'Onigiri: Page',
    canActivate: [hasNoPageGuard],
    data: {
      preloadAction: []
    }
  }
];
