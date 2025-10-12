// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject } from '@angular/core';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class AppTrackingService {

//   private _http = inject(HttpClient);

//   sendTrackingEvent(key: string, payload?: { [key: string]: string }) {
//     const data: AppTrackingRequestDto = {
//       key,
//       payload: payload || {}
//     };

//     return this._http.post(`${environment.onigiriApi}/api/tracking`, data)
//   }

// }

// interface AppTrackingRequestDto {
//   key: string;
//   payload: { [key: string]: string };
// }