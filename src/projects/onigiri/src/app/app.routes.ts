import { Routes } from '@angular/router';
import { SignUpPageComponent } from './modules/auth/signup-page/signup-page.component';
import { SignInPageComponent } from './modules/auth/signin-page/signin-page.component';
import { ErrorPageComponent } from './modules/error-page/error-page.component';
import {
  isFeatureEnabledGuard,
  userIsAuthorizedGuard
} from '@onigiri-services';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo
} from '@angular/fire/auth-guard';
import { SignInCompletionPageComponent } from './modules/auth/signin-completion';

// const redirectAuthenticatedUserToBoard = () => {

//   const api = inject(AccountsApiService);
//   const router = inject(Router);

//   return pipe(
//     redirectUnauthorizedTo(['signup']),
//     switchMap(() => {
//       return api.onSignIn().pipe(
//         tapResponse(
//           () => router.navigateByUrl('/board'),
//           () => router.navigateByUrl('/signup'),
//         )
//       )
//     })
//   );
// };

const redirectLoggedInUserToApp = () => {
  return redirectLoggedInTo(['']);
};

const redirectUnauthorizedToSignUp = () => redirectUnauthorizedTo(['signup']);

export const routes: Routes = [
  {
    path: 'signup',
    component: SignUpPageComponent,
    title: 'Onigiri: Sign Up',
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: redirectLoggedInUserToApp
    }
  },
  {
    path: 'signin',
    component: SignInPageComponent,
    title: 'Onigiri: Sign In',
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: redirectLoggedInUserToApp
    }
  },
  {
    path: 'i/:linkId',
    loadChildren: () =>
      import('./modules/shared-links/routes').then(r => r.SHARED_LINK_ROUTES),
    title: 'Onigiri: Shared Link',
    canActivate: []
  },
  {
    path: 'upgrade-subscription',
    loadChildren: () =>
      import('./modules/upgrade-subscription/routes').then(
        m => m.UPGRADE_SUBSCRIPTION_ROUTES
      ),
    canActivate: [
      AuthGuard,
      userIsAuthorizedGuard({ validateExpiration: false })
    ],
    title: 'Onigiri: Upgrade',
    data: {
      authGuardPipe: redirectUnauthorizedToSignUp
    }
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
    path: 'not-mobile-yet',
    loadChildren: () =>
      import('./modules/no-mobile-page/routes').then(m => m.NO_MOBILE_ROUTES)
  },
  {
    path: 'dev-test',
    loadChildren: () =>
      import('./modules/dev-test/routes').then(m => m.DEV_TEST_ROUTES),
    canActivate: [isFeatureEnabledGuard('devTest')]
  },
  {
    path: 'error',
    component: ErrorPageComponent
  },
  {
    path: '',
    loadChildren: () =>
      import('./modules/board-page/routes').then(m => m.BOARD_ROUTES),
    canActivate: [
      AuthGuard,
      userIsAuthorizedGuard({ validateExpiration: false })
    ],
    data: {
      authGuardPipe: redirectUnauthorizedToSignUp
    }
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'signup'
  }
];
