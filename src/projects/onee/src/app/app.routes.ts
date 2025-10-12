import { Routes } from '@angular/router';
import { SignUpPageComponent } from './pages/signup-page/signup-page.component';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo
} from '@angular/fire/auth-guard';
import { SignInPageComponent } from './pages/signin-page/signin-page.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { SignInCompletionPageComponent } from './pages/signin-completion';
import { userHasPageGuard } from './services/user-has-page.guard';

const redirectLoggedInUserToPageEditor = () => redirectLoggedInTo(['editor']);
const redirectUnauthorizedToSignUp = () => redirectUnauthorizedTo(['signup']);

export const routes: Routes = [
  {
    path: 'signup',
    component: SignUpPageComponent,
    canActivate: [AuthGuard],
    title: 'One Page: Sign Up',
    data: {
      authGuardPipe: redirectLoggedInUserToPageEditor
    }
  },
  {
    path: 'signin',
    component: SignInPageComponent,
    canActivate: [AuthGuard],
    title: 'One Page: Sign In',
    data: {
      authGuardPipe: redirectLoggedInUserToPageEditor
    }
  },
  {
    path: 'editor',
    loadChildren: () =>
      import('./pages/editor/routes').then(r => r.EDITOR_ROUTES),
    canActivate: [AuthGuard],
    title: 'One Page: Editor',
    data: { authGuardPipe: redirectUnauthorizedToSignUp }
  },
  {
    path: 'auth-completion',
    component: SignInCompletionPageComponent
  },
  {
    path: 'arc',
    component: SignInCompletionPageComponent
  },
  {
    path: 'error',
    component: ErrorPageComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'signup'
  }
];
