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
  MatChipsModule,
  MatAutocompleteModule,
  MatProgressBarModule
} from '@angular/material';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { CrearFamiliaresFuncionarioComponent } from './crear.component';
import { AdministracionPersonalGuard } from '../administracion-personal.guard';
const routes: Routes = [
  {
    path: '**',
    component: CrearFamiliaresFuncionarioComponent,
    canActivate: [AdministracionPersonalGuard]
  },
];


@NgModule({
  declarations: [ CrearFamiliaresFuncionarioComponent ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
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
    MatProgressBarModule,

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
export class FamiliaresFuncionarioModule { }
