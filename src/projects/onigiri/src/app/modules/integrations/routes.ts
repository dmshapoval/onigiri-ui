import { Routes } from '@angular/router';
import { IntegrationsPageComponent } from './integrations-page/integrations-page.component';

export const INTEGRATIONS_ROUTES: Routes = [{
  path: '',
  component: IntegrationsPageComponent,
  canActivate: [],
  title: 'Onigiri: Integrations'
}]; 