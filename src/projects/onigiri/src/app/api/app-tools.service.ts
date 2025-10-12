import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of, catchError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AppToolsService {
  private _http = inject(HttpClient);


  getOpenGraphMetadata(url: string): Observable<MetadataResponseDto> {
    return this._http.post<MetadataResponseDto>(`${environment.onigiriApi}/api/tools/og-metadata`, { url })
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