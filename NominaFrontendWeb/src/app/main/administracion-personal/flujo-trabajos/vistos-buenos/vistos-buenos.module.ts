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
  MAT_DATE_LOCALE,
  MatToolbarModule,
  MatDividerModule,
  MatTooltipModule,
  MatPaginatorIntl,
  MatBadgeModule,
  MatChipsModule,
  MatMenuModule,
  MatListModule,
  MatAutocompleteModule
} from '@angular/material';

import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';

import { ListarComponent } from './listar/listar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { MostrarService } from './mostrar/mostrar.service';
//
import { AprobadoresListarComponent } from './aprobadores/listar/listar.component';
import { AprobadorMostrarComponent } from './aprobadores/mostrar/mostrar.component';
import { AprobadoresFormularioComponent } from './aprobadores/formulario/formulario.component';
import { AprobadoresFiltroComponent } from './aprobadores/filtro/filtro.component';
//
import { AutorizadoresListarComponent } from './autorizadores/listar/listar.component';
import { AutorizadorMostrarComponent } from './autorizadores/mostrar/mostrar.component';
import { AutorizadoresFormularioComponent } from './autorizadores/formulario/formulario.component';
import { AutorizadoresFiltroComponent } from './autorizadores/filtro/filtro.component';
import { RevisoresListarComponent } from './revisores/listar/listar.component';
import { RevisorMostrarComponent } from './revisores/mostrar/mostrar.component';
import { RevisoresFiltroComponent } from './revisores/filtro/filtro.component';
import { RevisoresFormularioComponent } from './revisores/formulario/formulario.component';
import { VistosBuenosGuard } from './vistos-buenos.guard';



const routes: Routes = [

  {
    path: 'crear',
    component: FormularioComponent,
    canActivate:[VistosBuenosGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    canActivate:[VistosBuenosGuard],
    resolve: {
      data: FormularioService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange'
  },
  // {
  //   path: ':id/crear-aprobador',
  //   component: CrearAprobadorComponent,
  //   resolve: {
  //     data: CrearAprobadorService
  //   },
  // },

  // {
  //   path: ':id/crear-autorizador',
  //   component: CrearAutorizadorComponent,
  //   resolve: {
  //     data: CrearAutorizadorService
  //   },
  // },

  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[VistosBuenosGuard],
    resolve: {
      data: MostrarService
    },
  },

  {
    path: '**',
    component: ListarComponent,
    canActivate:[VistosBuenosGuard],
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
    //
    AprobadoresListarComponent,
    AprobadorMostrarComponent,
    AprobadoresFormularioComponent,
    AprobadoresFiltroComponent,
    //
    AutorizadoresListarComponent,
    AutorizadorMostrarComponent,
    AutorizadoresFormularioComponent,
    AutorizadoresFiltroComponent,
    //
    RevisoresListarComponent,
    RevisorMostrarComponent,
    RevisoresFiltroComponent,
    RevisoresFormularioComponent
  ],

  imports: [
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
    FormularioService,
    MostrarService,
    ListarService,
    FormularioComponent
    

  ],
  entryComponents: [
    FiltroComponent,
    AprobadorMostrarComponent,
    AprobadoresFormularioComponent,
    AprobadoresFiltroComponent,

    AutorizadorMostrarComponent,
    AutorizadoresFormularioComponent,
    AutorizadoresFiltroComponent,

    RevisorMostrarComponent,
    RevisoresFiltroComponent,
    RevisoresFormularioComponent

  ]
})
export class VistosBuenosModule { }
