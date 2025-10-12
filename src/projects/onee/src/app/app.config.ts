import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authHttpRequestInterceptor } from './services/http.interceptor';
import { APP_CONFIG, AppConfig, ZonelessEventPluginService } from '@oni-shared';
import { environment } from '../environments/environment';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideAnimations } from '@angular/platform-browser/animations';

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

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    provideHttpClient(withInterceptors([authHttpRequestInterceptor])),

    provideAngularSvgIcon(),

    provideAnimations(),

    provideRouter(routes)
  ]
};

// , {
//   provide: EVENT_MANAGER_PLUGINS,
//   useClass: ZonelessEventPluginService,
//   multi: true
// }

// StoreModule.forRoot<AppState>({
//   auth: accountReducer,
//   router: routerReducer,
//   navigation: navigationReducer,
//   tracking: trackingReducer,
//   customers: clientsReducer,
//   invoices: invoicesReducer,
//   projects: projectsReducer,
//   services: servicesReducer
// }),
