import { Routes } from '@angular/router';
import { SettingsPageComponent } from './settings-page/settings-page.component';

export const SETTINGS_ROUTES: Routes = [{
  path: '',
  component: SettingsPageComponent,
  canActivate: [],
  title: 'Onigiri: Settings'
}]; 