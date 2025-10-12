import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlockedRUPageComponent } from './blocked-ru-page.component';

const routes: Routes = [{
  path: 'ru',
  component: BlockedRUPageComponent
}]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class BlockedModule { }
