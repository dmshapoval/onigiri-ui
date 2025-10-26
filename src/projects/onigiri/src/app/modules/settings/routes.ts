import { Routes } from '@angular/router';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { businessEntityResolver } from './settings-page/settings-page-data.resover';

export const SETTINGS_ROUTES: Routes = [{
  path: '',
  component: SettingsPageComponent,
  canActivate: [],
  title: 'Onigiri: Settings',
  resolve: {
    entity: businessEntityResolver
  }
}]; 