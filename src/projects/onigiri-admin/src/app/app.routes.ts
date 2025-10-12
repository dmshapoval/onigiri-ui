import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';
import { SignInPageComponent } from './modules/sign-in/sign-in-page.component';

const redirectLoggedInUserToBoard = () => {
  return redirectLoggedInTo([''])
};

const redirectUnauthorizedToSignIn = () => redirectUnauthorizedTo(['signin']);

export const routes: Routes = [{
  path: 'signin',
  component: SignInPageComponent,
  title: 'Onigiri Admin: Sign In',
  canActivate: [AuthGuard],
  data: {
    authGuardPipe: redirectLoggedInUserToBoard,
  },
}, {
  path: '',
  loadChildren: () =>
    import('./modules/board/routes').then((m) => m.BOARD_ROUTES),
  canActivate: [AuthGuard],
  data: {
    authGuardPipe: redirectUnauthorizedToSignIn,
  },
}, {
  path: '**',
  pathMatch: 'full',
  redirectTo: 'signin',
},];
