import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateCustomerPortalSessionRequestDto, CreateStripeSessionResultDto } from './dtos/stripe';
import { ImageUploadResultDto } from './dtos/images';

@Injectable({ providedIn: 'root' })
export class ImagesService {

  private _http = inject(HttpClient);


  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this._http
      .post<ImageUploadResultDto>(`${environment.onigiriApi}/api/images`, formData)
      .pipe(map(x => x.image_id));
  }

  saveImageByUrl(url: string) {
    const payload = { image_url: url };
    return this._http
      .post<ImageUploadResultDto>(`${environment.onigiriApi}/api/images/by-url`, payload)
      .pipe(map(x => x.image_id));
  }

  getImageUrl(imageId: string) {
    return `https://imagedelivery.net/${environment.cfAccountHash}/${imageId}/public`;
  }

  createCustomerPortalSession(returnUrl: string) {
    const payload: CreateCustomerPortalSessionRequestDto = {
      return_url: returnUrl
    };

    return this._http.post<CreateStripeSessionResultDto>(`${environment.onigiriApi}/api/stripe/billing/session`, payload)
      .pipe(map(x => x.redirect_url))
  }
}

