import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { APP_CONFIG } from '../app-config';


@Injectable({ providedIn: 'root' })
export class AppToolsService {
  private _http = inject(HttpClient);
  private _api = inject(APP_CONFIG).onigiriApi;


  getOpenGraphMetadata(url: string): Observable<MetadataResponseDto> {
    return this._http.post<MetadataResponseDto>(`${this._api}/api/tools/og-metadata`, { url })
      .pipe(catchError(e => of({ success: false, data: null })));
  }

}

export interface MetadataResponseDto {
  success: boolean;
  data: UrlMetadataDto | null;
}

export interface UrlMetadataDto {
  description: string | null;
  title: string | null;
  logo: string | null;
  image: string | null;
  author: string | null;
  date: string | null;
  video: null | null;
  publisher: string | null;
}

// interface OGImageInfoDto {
//   type: string | null;
//   url: string | null;
// }