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
  MatBadgeModule,
  MatPaginatorIntl,
  MatAutocompleteModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatListModule,
  MatMenuModule,
} from '@angular/material';

import { CrearComponent } from './crear/crear.component';
import { EditarComponent } from './editar/editar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { ConceptoComponent } from './concepto/concepto.component';
import { CrearConceptoComponent } from './crear-concepto/crear-concepto.component';
import { EditarService } from './editar/editar.service';
import { CrearConceptoService } from './crear-concepto/crear-concepto.service';
import { MostrarService } from './mostrar/mostrar.service';
import { MostrarComponent } from './mostrar/mostrar.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { TipoAusentismosGuard } from './tipo-ausentismos.guard';

const routes: Routes = [
  {
    path: 'crear',
    component: CrearComponent,
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
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [TipoAusentismosGuard],
  },

  {
    path: ':id/crear-concepto',
    component: CrearConceptoComponent,
    resolve: {
      data: CrearConceptoService
    },
  },

  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TipoAusentismosGuard],
  },
];

@NgModule({
  declarations: [
    CrearComponent,
    EditarComponent,
    FiltroComponent,
    ListarComponent,
    ConceptoComponent,
    CrearConceptoComponent,
    MostrarComponent
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

    //
    AlcanosConfirmDialogModule,
    GestorArchivosModule,

  ],
  providers: [
    ListarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [
    FiltroComponent,
    CrearConceptoComponent
  ]
})
export class TipoAusentismosModule { }
