import { Routes } from '@angular/router';
import { NoMobilePageComponent } from './page.component';

export const NO_MOBILE_ROUTES: Routes = [
  {
    path: '',
    component: NoMobilePageComponent,
    canActivate: [],
    title: 'Onigiri: Not mobile yet'
  }
];
