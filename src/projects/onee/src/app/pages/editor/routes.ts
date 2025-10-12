import { Routes } from '@angular/router';
import { PageEditorPageComponent } from './page-editor-page/page-editor-page.component';
import { userHasPageGuard } from '../../services/user-has-page.guard';
import { OnboardingPageComponent } from './onboarding-page/onboarding-page.component';

export const EDITOR_ROUTES: Routes = [
  {
    path: 'onboarding',
    component: OnboardingPageComponent,
    // NOTE: it is important to have this guard here and not on the parent level
    // to be sure that authentication flow completed before guard executed
    canActivate: [userHasPageGuard]
  },
  {
    path: '',
    component: PageEditorPageComponent,
    // NOTE: it is important to have this guard here and not on the parent level
    // to be sure that authentication flow completed before guard executed
    canActivate: [userHasPageGuard]
  }
];
