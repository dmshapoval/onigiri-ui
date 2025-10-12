import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@oni-shared';

@Injectable({ providedIn: 'root' })
export class OneePagesApiService {

  #http = inject(HttpClient);
  #apiUrl = inject(APP_CONFIG).oneePagesApi;

  getOneeStatus() {
    return this.#http.get<OneeUserStatusDto>(`${this.#apiUrl}/api/account/status`);
  }

  signupUser() {
    return this.#http.post<void>(`${this.#apiUrl}/api/account/signup`, null);
  }

}

interface OneeUserStatusDto {
  is_registered: boolean;
  has_page: boolean;
}
