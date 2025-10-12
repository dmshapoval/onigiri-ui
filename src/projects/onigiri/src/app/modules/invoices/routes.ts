import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot, Routes } from '@angular/router';
import { InvoicePreviewPageComponent } from './invoice-preview-page/invoice-preview-page.component';
import { InvoiceEditorComponent } from './invoice-editor/invoice-editor.component';
import { InvoicesPageComponent } from './invoices-page/invoices-page.component';
import { Invoice } from '../../models/invoice';
import { inject } from '@angular/core';
import { InvoicesApiService } from '../../api/invoices-api.service';
import { catchError, of } from 'rxjs';

// const invoiceResolver: ResolveFn<Invoice | null> = (route, state) => {
//   return inject(InvoicesApiService)
//     .getInvoice(route.paramMap.get('id')!).pipe(
//       catchError(e => {
//         return of(null)
//       })
//     )
//     ;
// }

export const INVOICES_ROUTES: Routes = [{
  path: ':id/preview',
  component: InvoicePreviewPageComponent,
  title: 'Onigiri: Invoice Preview',
  data: {
    hideNav: true,
  }
}, {
  path: ':id',
  component: InvoiceEditorComponent,
  title: 'Onigiri: Invoice Edit',
  data: {
    hideNav: true
  }
}, {
  path: '',
  component: InvoicesPageComponent,
  title: 'Onigiri: Invoices',
  data: {
    preloadAction: []
  }
}]; 