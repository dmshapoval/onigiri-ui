import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Service, ServiceData } from '@onigiri-models';
import * as A from 'fp-ts/es6/Array';
import { Observable, map } from 'rxjs';
import { ServiceDto, toService, toServiceDataDto } from './dtos/services';


@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private _http = inject(HttpClient);

  getAllServices(): Observable<Service[]> {
    return this._http.get<ServiceDto[]>(`${environment.onigiriApi}/api/services`)
      .pipe(map(A.map(toService)));
  }

  createService(data: ServiceData) {
    const payload = toServiceDataDto(data);
    return this._http.post<ServiceDto>(`${environment.onigiriApi}/api/services`, payload)
      .pipe(map(toService));
  }

  updateService(id: string, data: ServiceData) {
    const payload = toServiceDataDto(data);
    return this._http.put<ServiceDto>(`${environment.onigiriApi}/api/services/${id}`, payload)
      .pipe(map(toService));
  }

  deleteService(id: string) {
    return this._http.delete<void>(`${environment.onigiriApi}/api/services/${id}`);
  }
}

