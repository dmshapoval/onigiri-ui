import { Routes } from '@angular/router';
import { ProjectsPageComponent } from './projects-page/projects-page.component';
import { ProjectEditPageComponent } from './project-edit-page/project-edit-page.component';

export const PROJECTS_ROUTES: Routes = [{
  path: ':id',
  component: ProjectEditPageComponent,
  title: 'Onigiri: Edit Project',
  canActivate: [],
  data: {
    hideNav: true,
  }
}, {
  path: '',
  component: ProjectsPageComponent,
  title: 'Onigiri: Projects',
  canActivate: [],
  data: {
  }
}]; 