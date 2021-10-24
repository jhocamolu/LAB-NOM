import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import {
  MatDialogModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatDatepickerModule,
  MatInputModule,
  MatSelectModule,
  MatFormFieldModule,
  MatIconModule,
  MatTableModule,
  MatPaginatorModule,
  MatCardModule,
  MatExpansionModule,
  MatTabsModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MAT_DATE_LOCALE,
  MatToolbarModule,
  MatDividerModule,
  MatTooltipModule,
  MatPaginatorIntl,
  MatBadgeModule,
} from '@angular/material';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { PaginaCrearComponent } from './crear-pagina/crear.component';

const routes: Routes = [
  {
    path: '**',
    component: PaginaCrearComponent,
  },
];
@NgModule({
  declarations: [ PaginaCrearComponent ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,

    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,

    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [ ],
})
export class PruebasModule { }
