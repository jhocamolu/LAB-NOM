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
  DateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material';

import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { FiltroComponent } from './filtro/filtro.component';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';

// Pruebas
import { UnoCrearComponent } from '../pruebas/uno-crear-modal/crear.component';
// Administración de personal
import { RegistraduriaComponent } from '../administracion-personal/registraduria/crear.component';
//  nomina
import { ArchivoTipo1PilaComponent } from '../nomina/archivo-pila-uno/crear.component'; 

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MediosMagneticosComponent } from '../nomina/medios-magneticos/crear.component';

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
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];
@NgModule({
  declarations: [
    ListarComponent,
    FiltroComponent,
    UnoCrearComponent,
    RegistraduriaComponent,
    ArchivoTipo1PilaComponent,
    MediosMagneticosComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,

    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
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
    MatAutocompleteModule,

    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    ListarComponent,
  ],
  entryComponents: [
    FiltroComponent,
    UnoCrearComponent,
    RegistraduriaComponent,
    ArchivoTipo1PilaComponent,
    MediosMagneticosComponent
  ],
})
export class DashboardModule { }
