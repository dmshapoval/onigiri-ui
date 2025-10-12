import { Routes } from '@angular/router';
import { ClientsPageComponent } from './clients-page/clients-page.component';

export const CLIENTS_ROUTES: Routes = [{
  path: '',
  // pathMatch: 'full',
  title: 'Onigiri: Clients',
  component: ClientsPageComponent,
  data: {
  }
}]; 