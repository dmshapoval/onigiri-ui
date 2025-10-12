import { ApplicationConfig } from "@angular/core";
import { provideRouter, withDebugTracing } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { routes } from "./app.routes";
import { DEFAULT_DIALOG_CONFIG } from "@angular/cdk/dialog";
import { EVENT_MANAGER_PLUGINS } from "@angular/platform-browser";
import { APP_CONFIG, AppConfig, ZonelessEventPluginService } from "@oni-shared";
import { environment } from "../environments/environment";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authHttpRequestInterceptor } from "./api/http.interceptor";

import { provideStoreDevtools } from "@ngrx/store-devtools";
import { provideAngularSvgIcon } from "angular-svg-icon";

const appEnvConfiguration: AppConfig = {
  onigiriApi: environment.onigiriApi,
  oneePagesApi: environment.oneePagesApi,
  cloudflareAccountHash: environment.cfAccountHash,
  isProduction: environment.production,
  pagesHostApp: environment.pagesHostApp
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: appEnvConfiguration },
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: ZonelessEventPluginService,
      multi: true
    },

    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: {
        hasBackdrop: true,
        closeOnNavigation: true,
        width: "860px"
      }
    },

    provideAnimations(),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 50 // maximum stack trace frames to be stored (in case trace option was provided as true)
    }),

    provideHttpClient(withInterceptors([authHttpRequestInterceptor])),

    provideAngularSvgIcon(),

    provideRouter(
      routes
      // withDebugTracing()
    )
  ]
};
