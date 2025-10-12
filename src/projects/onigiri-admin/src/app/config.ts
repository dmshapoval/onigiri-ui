import { InjectionToken } from "@angular/core";


export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig');

export interface AppConfig {
  isProduction: boolean;
  urls: {
    onigiri: string;
    oneePages: string
  }
}
