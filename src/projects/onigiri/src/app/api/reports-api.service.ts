import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Currency } from '@onigiri-models';
import { toLocalDateDto } from './dtos/date-time';


@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  #http = inject(HttpClient);

  getDashboardReport(currency: Currency, fromDate: Date | null, toDate: Date | null) {
    let params = new HttpParams()
      .append('currency', currency);

    if (fromDate) {
      params = params.append('fromDate', toLocalDateDto(fromDate))
    }

    if (toDate) {
      params = params.append('toDate', toLocalDateDto(toDate))
    }

    return this.#http.get<DashboardReportDto>(`${environment.onigiriApi}/api/reports/dashboard`, { params });
  }

}

interface DashboardReportDto {
  paid: number;
  waiting: number;
  overdue: number;
}