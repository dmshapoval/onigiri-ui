import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { APP_CONFIG, AppConfig } from './config';
import { authHttpRequestInterceptor } from './services/http.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

const appEnvConfiguration: AppConfig = {
  urls: environment.urls,
  isProduction: environment.production,
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),

    provideHttpClient(
      withInterceptors([authHttpRequestInterceptor])
    ),

    { provide: APP_CONFIG, useValue: appEnvConfiguration },

    ConfirmationService, MessageService, DialogService
  ]
};
