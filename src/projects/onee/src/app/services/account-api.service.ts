import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { APP_CONFIG } from '@oni-shared';

@Injectable({ providedIn: 'root' })
export class AccountApiService {

  #http = inject(HttpClient);
  #apiUrl = inject(APP_CONFIG).oneePagesApi;
  #onigiriUrl = inject(APP_CONFIG).onigiriApi;

  getStatus() {
    return this.#http.get<OneeUserStatusDto>(`${this.#apiUrl}/api/account/status`);
  }

  getOnigiriStatus() {
    return this.#http.get<OnigiriUserStatusDto>(`${this.#onigiriUrl}/api/account/status`);
  }

  signupUser() {
    return this.#http.post<void>(`${this.#apiUrl}/api/account/signup`, null);
  }

  createSignUpByEmailRequest(email: string, completionUrl: string, queryParams?: { [k: string]: string }) {
    const payload = {
      email,
      app_url: completionUrl,
      params: queryParams || {}
    };

    return this.#http.post<void>(`${this.#apiUrl}/api/auth/requests/signup`, payload);
  }

  createSignInByEmailRequest(email: string, completionUrl: string, queryParams?: { [k: string]: string }) {
    const payload = {
      email,
      app_url: completionUrl,
      params: queryParams || {}
    };

    return this.#http
      .post<void>(`${this.#apiUrl}/api/auth/requests/signin`, payload);
  }

  completeAuthRequest<T>(requestId: string) {
    return this.#http
      .post<AuthRequestCompleteResultDto>(`${this.#apiUrl}/api/auth/requests/${requestId}/complete`, null);
  }

  onSignInByLinkCompleted(requestId: string) {
    return this.#http
      .delete<void>(`${this.#apiUrl}/api/auth/requests/${requestId}`);
  }
}

interface OneeUserStatusDto {
  is_registered: boolean;
  has_page: boolean;
}

interface OnigiriUserStatusDto {
  is_registered: boolean;
}

interface AuthRequestCompleteResultDto {
  token: string;
  data: { pageKey?: string }
}

