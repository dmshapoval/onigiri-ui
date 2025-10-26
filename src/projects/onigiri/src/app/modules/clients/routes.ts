import { Routes } from '@angular/router';
import { ClientsPageComponent } from './clients-page/clients-page.component';
import { clientsListDataResolver } from './clients-page/client-page-data.resolver';

export const CLIENTS_ROUTES: Routes = [{
  path: '',
  // pathMatch: 'full',
  title: 'Onigiri: Clients',
  component: ClientsPageComponent,
  data: {
  }
}]; 