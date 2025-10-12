// import { NgModule } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Routes } from '@angular/router';
// import { TableModule } from 'primeng/table';
// import { InvoicesPageComponent } from './pages/invoices-page/invoices-page.component';
// import {
//   INVOICE_EDITOR_COMPONENTS
// } from './pages/invoice-edit-page';
// import { InvoicePreviewPageComponent } from './pages/invoice-preview-page/invoice-preview-page.component';
// import { ButtonComponent } from '@onigiri-shared/button.component';
// import { OnigiriIconComponent } from '@oni-shared';
// import { EmptyStatePlaceholderComponent } from '@onigiri-shared/empty-state-placeholder/empty-state-placeholder.component';
// import { OnigiriDatePipe } from '@onigiri-shared/date';
// import {
//   CurrencySelectorComponent, SendInvoiceButtonComponent,
//   ShareLinkDialogComponent
// } from './components';
// import { DownloadInvoicePDFButtonComponent } from '@onigiri-shared/download-invoice-pdf-button.component';
// import { InlineLoaderComponent } from '@onigiri-shared/inline-loader/inline-loader.component';
// import { SendInvoiceDialogComponent } from './components/send-invoice-dialog/send-invoice-dialog.component';
// import { AddressComponent } from '@onigiri-shared/address.component';
// import { DragDropModule } from '@angular/cdk/drag-drop';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextModule } from 'primeng/inputtext';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { InvoiceViewComponent } from '@onigiri-shared/invoice-view/invoice-view.component';
// import { OnigiriRefFooterComponent } from '@onigiri-shared/onigiri-ref-footer.component';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { LetDirective } from '@ngrx/component';
// import { restoreInvoices } from '@onigiri-store';
// import { DropdownModule } from 'primeng/dropdown';
// import { OnigiriDateInputComponent } from '@onigiri-shared/date-input/date-input.component';
// import { CustomerSelectorComponent } from '@onigiri-shared/customer-selector/customer-selector.component';

// import { ImageUploadComponent } from '@onigiri-shared/image-upload/image-upload.component';
// import { ProjectSelectorComponent } from '@onigiri-shared/project-selector/project-selector.component';
// import { AutoCompleteModule } from 'primeng/autocomplete';
// import { CopyLinkButtonComponent } from '@onigiri-shared/components/copy-link-button.component';
// import { OnigiriTemplate } from '@onigiri-shared/directives/onigiri-template.directive';
// import { InvoiceEditPageComponent } from './pages/invoice-edit-page/invoice-edit-page.component';


// const routes: Routes = [{
//   path: ':id/preview',
//   component: InvoicePreviewPageComponent,
//   title: 'Onigiri: Invoice Preview',
//   canActivate: [],
//   data: {
//     hideNav: true,
//   }
// }, {
//   path: ':id',
//   component: InvoiceEditPageComponent,
//   title: 'Onigiri: Invoice Edit',
//   canActivate: [],
//   data: {
//     hideNav: true
//   }
// }, {
//   path: '',
//   component: InvoicesPageComponent,
//   title: 'Onigiri: Invoices',
//   data: {
//     preloadAction: restoreInvoices()
//   }
// }];

// @NgModule({
//   imports: [
//     CommonModule,
//     FormsModule, ReactiveFormsModule,
//     RouterModule.forChild(routes),

//     DragDropModule,

//     LetDirective,

//     ButtonComponent, OnigiriIconComponent, EmptyStatePlaceholderComponent,
//     DownloadInvoicePDFButtonComponent, InlineLoaderComponent, ImageUploadComponent,
//     OnigiriIconComponent, AddressComponent, OnigiriRefFooterComponent,
//     OnigiriDateInputComponent, CustomerSelectorComponent,
//     ProjectSelectorComponent, CopyLinkButtonComponent,
//     InvoiceViewComponent,

//     OnigiriDatePipe, OnigiriTemplate,

//     TableModule, InputTextModule, InputNumberModule, AutoCompleteModule,
//     InputTextareaModule, SelectButtonModule, DropdownModule
//   ],
//   exports: [],
//   declarations: [

//   ],
//   providers: [],
// })
// export class UserInvoicesModule { }
