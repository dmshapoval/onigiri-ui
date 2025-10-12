import { Routes } from "@angular/router";
import { UsersListPageComponent } from "./pages/users-list-page/users-list-page.component";
import { UserDetailsPageComponent } from "./pages/user-details-page/user-details-page.component";

export const USERS_ROUTES: Routes = [{
  path: ':userId',
  component: UserDetailsPageComponent,
  title: 'Onigiri: Users'
}, {
  path: '',
  pathMatch: 'full',
  component: UsersListPageComponent,
  title: 'Onigiri: Users'
}]; 