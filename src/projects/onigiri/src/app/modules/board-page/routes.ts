import { Routes } from "@angular/router";
import { isActiveSubscriptionGuard } from "@onigiri-services";
import { BoardPageComponent } from "./board-page.component";
import { DashboardPageComponent } from "./dashboard-page/dashboard-page.component";

export const BOARD_ROUTES: Routes = [
  {
    path: "",
    component: BoardPageComponent,
    children: [
      {
        path: "dashboard",
        component: DashboardPageComponent,
        canActivate: [isActiveSubscriptionGuard],
        data: {}
      },
      {
        path: "invoices",
        loadChildren: () =>
          import("../invoices/routes").then(m => m.INVOICES_ROUTES),
        canActivate: [isActiveSubscriptionGuard],
        data: {}
      },
      {
        path: "clients",
        loadChildren: () =>
          import("../clients/routes").then(m => m.CLIENTS_ROUTES),
        canActivate: [isActiveSubscriptionGuard],
        data: {}
      },
      {
        path: "services",
        loadChildren: () =>
          import("../services/routes").then(m => m.SERVICES_ROUTES),
        canActivate: [isActiveSubscriptionGuard],
        data: {}
      },
      // {
      //   path: 'projects',
      //   loadChildren: () =>
      //     import('../projects/routes').then((m) => m.PROJECTS_ROUTES),
      //   canActivate: [isActiveSubscriptionGuard],
      //   data: {},
      // },
      {
        path: "settings",
        loadChildren: () =>
          import("../settings/routes").then(m => m.SETTINGS_ROUTES),
        canActivate: [],
        data: {}
      },
      // {
      //   path: 'integrations',
      //   loadChildren: () =>
      //     import('../integrations/routes').then((m) => m.INTEGRATIONS_ROUTES),
      //   canActivate: [],
      //   data: {},
      // },
      {
        path: "page",
        canActivate: [],
        loadChildren: () =>
          import("../link-in-bio/routes").then(m => m.LINK_IN_BIO_ROUTES)
      },
      {
        path: "",
        pathMatch: "full",
        redirectTo: "invoices"
      }
    ]
  }
];
