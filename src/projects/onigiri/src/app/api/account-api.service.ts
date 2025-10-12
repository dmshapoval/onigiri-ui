import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppUserDto, toAppUser } from './dtos/account';
import { AppUser } from '@onigiri-models';
import { APP_CONFIG } from '@oni-shared';

@Injectable({ providedIn: 'root' })
export class AccountApiService {

  #http = inject(HttpClient);
  #onigiriApi = inject(APP_CONFIG).onigiriApi;

  getAccountStatus() {
    return this.#http
      .get<AccountStatusDto>(`${this.#onigiriApi}/api/account/status`);
  }

  getUserInfo(): Observable<AppUser> {
    return this.#http
      .get<AppUserDto>(`${this.#onigiriApi}/api/account/info`)
      .pipe(map(toAppUser));
  }


  initOnigiriTrial() {
    return this.#http
      .post<void>(`${this.#onigiriApi}/api/account/subscriptions/onigiri-trial`, null);
  }

  updateUserTimeZone() {
    return this.#http.patch(`${this.#onigiriApi}/api/account/time-zone`, null)
  }

  onSignUp() {
    return this.#http.post<void>(`${this.#onigiriApi}/api/account/sign-up`, null);
  }

  onSignIn() {
    return this.#http.post<void>(`${this.#onigiriApi}/api/account/sign-in`, null);
  }

  createSignUpRequest(email: string, completionUrl: string, queryParams?: { [k: string]: string }) {
    const payload = {
      email,
      app: 'Onigiri',
      app_url: completionUrl,
      params: queryParams || {}
    };

    return this.#http
      .post<void>(`${this.#onigiriApi}/api/auth/requests/signup`, payload);
  }

  createSignInRequest(email: string, completionUrl: string, queryParams?: { [k: string]: string }) {
    const payload = {
      email,
      app: 'Onigiri',
      app_url: completionUrl,
      params: queryParams || {}
    };

    return this.#http
      .post<void>(`${this.#onigiriApi}/api/auth/requests/signin`, payload);
  }

  completeAuthRequest(requestId: string) {
    return this.#http
      .post<AuthRequestCompleteResultDto>(`${this.#onigiriApi}/api/auth/requests/${requestId}/complete`, null);
  }

  getAuthRequestInfo(requestId: string) {
    return this.#http
      .get<AuthRequestInfoDto>(`${this.#onigiriApi}/api/auth/requests/${requestId}`);
  }

  onSignInByLinkCompleted(requestId: string) {
    return this.#http
      .delete<void>(`${this.#onigiriApi}/api/auth/requests/${requestId}`);
  }
}

interface AuthRequestCompleteResultDto {
  token: string;
}



interface AuthRequestInfoDto {
  email: string;
}

interface AccountStatusDto {
  is_registered: boolean;
  subscription_is_active: boolean;
}