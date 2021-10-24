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
  MAT_DIALOG_DATA,
  MatToolbarModule,
  MatDividerModule,
  MatTooltipModule,
  MatBadgeModule,
  MatPaginatorIntl,
  MatAutocompleteModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatListModule,
  MatMenuModule,
  MatSidenavModule,

} from '@angular/material';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';

import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { ListarService } from './listar/listar.service';


import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxMaskModule } from 'ngx-mask';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosSnackbarModule } from '@alcanos/services';
import { DocumentosComponent } from './documentos/documentos.component';
import { AprobarComponent } from './aprobar/aprobar.component';
import { PermisosGuard } from './permisos.guard';

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
    canActivate:[PermisosGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    canActivate:[PermisosGuard],
    resolve: {
      data: FormularioService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[PermisosGuard],
    resolve: {
      data: MostrarService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[PermisosGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    FormularioComponent,
    DocumentosComponent,
    AprobarComponent
  ],
  imports: [
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes),
    MatMenuModule,
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSidenavModule,
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
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
    GestorArchivosModule,
    AlcanosSnackbarModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    FormularioService,
    ListarService,
    MostrarService,
    MostrarComponent,
  ],
  entryComponents: [
    FiltroComponent,
    MostrarComponent,
    FormularioComponent,
    DocumentosComponent,
    AprobarComponent
  ]
})
export class PermisosModule { }
