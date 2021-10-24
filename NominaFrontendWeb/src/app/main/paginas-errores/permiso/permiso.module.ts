import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatButtonModule, MatIconModule } from '@angular/material';

const routes: Routes = [
  {
    path: '**',
    component: ListComponent,
  },

];


@NgModule({
  declarations: [ListComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class PermisoModule { }
