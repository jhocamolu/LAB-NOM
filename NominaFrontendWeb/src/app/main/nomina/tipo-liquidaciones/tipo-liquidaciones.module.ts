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
  MatBadgeModule,
  MatPaginatorIntl,
  MatAutocompleteModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatListModule,
  MatChipsModule,
  MatMenuModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material';

import { LiquidacionFormComponent } from './liquidacion-form/liquidacion-form.component';
import { CrearConceptoComponent } from './crear-concepto/crear-concepto.component';
import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { ListarEditarComponent } from './listar-editar/listar-editar.component';

import { ListarService } from './listar/listar.service';
import { ListarEditarService } from './listar-editar/listar-editar.service';
import { CrearConceptoService } from './crear-concepto/crear-concepto.service';
import { LiquidacionFormService } from './liquidacion-form/liquidacion-form.service';
import { EditarService } from './editar/editar.service';
import { MostrarService } from './mostrar/mostrar.service';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { EditarComponent } from './editar/editar.component';
import { EstadosComponent } from './estados/estados.component';
import { CrearEstadoComponent } from './crear-estado/crear-estado.component';
import { CrearEstadoService } from './crear-estado/crear-estado.service';

import { FormularioParametroComponent } from './parametros-formulario/formulario.component'; 
import { ParametroComponent } from './parametros/parametro.component';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { FiltroConceptoComponent } from './filtro-concepto/filtro-concepto.component';
import { TipoLiquidacionesGuard } from './tipo-liquidaciones.guard';

const routes: Routes = [

  {
    path: 'crear',
    component: LiquidacionFormComponent,
  },
  {
    path: ':id/editar',
    component: EditarComponent,
    resolve: {
      data: EditarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange'
  },
  {
    path: ':id/crear-concepto',
    component: CrearConceptoComponent,
    resolve: {
      data: CrearConceptoService
    },
  },

  {
    path: ':id/crear-estado',
    component: CrearEstadoComponent,
    resolve: {
      data: CrearEstadoService
    },
  },

  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [TipoLiquidacionesGuard],
  },
  {
    path: ':id/lista-editar',
    component: ListarEditarComponent,
    resolve: {
      data: ListarEditarService
    },
  },

  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TipoLiquidacionesGuard],
  },
];


@NgModule({
  declarations: [
    LiquidacionFormComponent,
    CrearConceptoComponent,
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    EditarComponent,
    ListarEditarComponent,
    EstadosComponent,
    CrearEstadoComponent,
    ParametroComponent, 
    FormularioParametroComponent,

    FiltroConceptoComponent,
  ],

  imports: [
    RouterModule.forChild(routes),
    MatMenuModule,
    CommonModule,

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
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
    GestorArchivosModule,
  ],
  providers: [
    ListarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    LiquidacionFormService,
    EditarService,
    MostrarService,
    ListarEditarService
  ],
  entryComponents: [
    FiltroComponent,
    FiltroConceptoComponent, 
    FormularioParametroComponent
  ]
})
export class TipoLiquidacionesModule { }
