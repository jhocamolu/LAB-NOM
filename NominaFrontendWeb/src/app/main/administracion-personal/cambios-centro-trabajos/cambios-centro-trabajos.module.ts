import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { ListarService } from './listar/listar.service';
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
  MatToolbarModule,
  MatDividerModule,
  MatTooltipModule,
  MatSidenavModule,
  MatPaginatorIntl,
  MatBadgeModule,
  MatMenuModule,
  MatAutocompleteModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MAT_DATE_LOCALE,
  DateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material';

import { ListarComponent } from './listar/listar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { CambiosCentroTrabajosGuard } from './cambios-centro-trabajos.guard';
import { MomentDateAdapter } from '@angular/material-moment-adapter';


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
    path: 'crear',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    canActivate: [CambiosCentroTrabajosGuard],
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [CambiosCentroTrabajosGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [CambiosCentroTrabajosGuard],
  },
];

@NgModule({
  declarations: [
    ListarComponent,
    FormularioComponent,
    MostrarComponent,
    FiltroComponent
  ],

  imports: [
    RouterModule.forChild(routes),
    CommonModule,

    MatButtonModule,
    MatMenuModule,
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
    MatSidenavModule,
    MatBadgeModule,
    MatAutocompleteModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule
  ],
  providers: [
    ListarService,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
  entryComponents: [
    MostrarComponent,
    FiltroComponent
  ],
})
export class CambiosCentroTrabajosModule { }
