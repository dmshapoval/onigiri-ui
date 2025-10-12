import { InjectionToken } from "@angular/core";

export interface AppConfig {
  onigiriApi: string;
  oneePagesApi: string;
  pagesHostApp: string;
  cloudflareAccountHash: string;
  isProduction: boolean;
}


export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig');