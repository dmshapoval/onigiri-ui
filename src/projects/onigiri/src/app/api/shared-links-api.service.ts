import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedInvoiceLinkData } from '@onigiri-models';
import { InvoicePDFRequestResultDto } from './dtos/invoices';
import { map } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SharedLinksApiService {
  #http = inject(HttpClient);


  getInvoiceLinkData(linkId: string) {
    return this.#http.get<SharedInvoiceLinkData>(`${environment.onigiriApi}/api/invoices/public-links/${linkId}/data`);
  }

  getSharedInvoicePDF(linkId: string) {
    return this.#http.get<InvoicePDFRequestResultDto>(`${environment.onigiriApi}/api/invoices/public-links/${linkId}/actions/pdf`)
      .pipe(map(x => x.url));
  }


}


