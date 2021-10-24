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
  MatProgressBarModule,
  DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { CrearBeneficioCorporativoComponent } from './crear.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AdministracionPersonalGuard } from '../administracion-personal.guard';

const DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'DD MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'DD MMMM YYYY',
  },
};


const routes: Routes = [
  {
    path: '**',
    component: CrearBeneficioCorporativoComponent,
    canActivate: [AdministracionPersonalGuard]
  },
];


@NgModule({
  declarations: [ CrearBeneficioCorporativoComponent ],
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
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS }
  ],
  entryComponents: [ ],
})
export class BeneficioCorporativoModule { }
