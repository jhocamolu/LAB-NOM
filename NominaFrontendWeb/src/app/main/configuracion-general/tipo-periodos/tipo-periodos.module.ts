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
import { ListarComponent } from './listar/listar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';

import { EditarService } from './editar/editar.service';

import { MostrarComponent } from './mostrar/mostrar.component';
import { SubperiodoComponent } from './subperiodos/subperiodos.component';
import { SubperiodoFormComponent } from './subperiodo-form/subperiodo-form.component';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MostrarService } from './mostrar/mostrar.service';
import { TipoPeriodosGuard } from './tipo-periodos.guard';

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
  },

  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [TipoPeriodosGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TipoPeriodosGuard],
  },
];
@NgModule({
  declarations: [
    CrearComponent,
    EditarComponent,
    ListarComponent,
    FiltroComponent,
    SubperiodoComponent,
    SubperiodoFormComponent,
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
    GestorArchivosModule,
  ],
  providers: [
    ListarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [
    FiltroComponent,
    SubperiodoFormComponent,
  ],
})
export class TipoPeriodosModule { }
