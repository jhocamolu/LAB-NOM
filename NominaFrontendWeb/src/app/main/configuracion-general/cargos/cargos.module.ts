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
  MatAutocompleteModule,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material';

import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';


import { ListarComponent } from './listar/listar.component';
import { CrearComponent } from './crear/crear.component';
import { EditarComponent } from './editar/editar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { EditarService } from './editar/editar.service';


import { ReportaComponent } from './reporta/reporta.component';
import { GradoComponent } from './grado/grado.component';

import { PresupuestoCrearComponent } from './presupuesto/crear/crear.component';
import { PresupuestoEditarComponent } from './presupuesto/editar/editar.component';

import { DependenciaComponent } from './dependencia/dependencia.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CargosGuard } from './cargos.guard';


const routes: Routes = [
  {
    path: ':id/editar',
    component: EditarComponent,
    resolve: {
      data: EditarService
    }
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [CargosGuard],
  },
  {
    path: 'crear',
    component: CrearComponent,
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [CargosGuard],
  },
];
@NgModule({
  declarations: [
    CrearComponent,
    EditarComponent,
    ListarComponent,
    FiltroComponent,
    MostrarComponent,
    ReportaComponent,
    GradoComponent,
    DependenciaComponent,
    PresupuestoCrearComponent,
    PresupuestoEditarComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatListModule,
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
    CKEditorModule,
    //
    AlcanosSharedModule
  ],
  providers: [
    ListarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
  entryComponents: [
    CrearComponent,
    EditarComponent,
    FiltroComponent,
    ReportaComponent,
    GradoComponent,
    DependenciaComponent,
    PresupuestoCrearComponent,
    PresupuestoEditarComponent
  ],
})
export class CargosModule { }
