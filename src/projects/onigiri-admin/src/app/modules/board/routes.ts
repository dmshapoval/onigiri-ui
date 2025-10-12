import { Routes } from "@angular/router";
import { BoardPageComponent } from "./board-page/board-page.component";

export const BOARD_ROUTES: Routes = [{
  path: '',
  component: BoardPageComponent,
  children: [{
    path: 'users',
    loadChildren: () =>
      import('../users/routes').then((m) => m.USERS_ROUTES),
    data: {},
  }, {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  }]
}]