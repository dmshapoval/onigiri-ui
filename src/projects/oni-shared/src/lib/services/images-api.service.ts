import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ImageUploadResultDto } from './dto/images';
import { APP_CONFIG } from '../app-config';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private _api = inject(APP_CONFIG).onigiriApi;
  private _http = inject(HttpClient);

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this._http
      .post<ImageUploadResultDto>(`${this._api}/api/images`, formData)
      .pipe(map(x => x.image_id));
  }

  saveImageByUrl(url: string) {
    const payload = { image_url: url };
    return this._http
      .post<ImageUploadResultDto>(`${this._api}/api/images/by-url`, payload)
      .pipe(map(x => x.image_id));
  }
}
