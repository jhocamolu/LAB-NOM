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
  MatListModule,
  MatMenuModule,
  MatAutocompleteModule
} from '@angular/material';

import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';


import { ListarComponent } from './listar/listar.component';
import { CrearComponent } from './crear/crear.component';
import { EditarComponent } from './editar/editar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { EditarService } from './editar/editar.service';

import { DiaComponent } from './dia/dia.component';
import { DiaEditarComponent } from './dia-editar/dia-editar.component';
import { DiaMostrarComponent } from './dia-mostrar/dia-mostrar.component';


import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MostrarComponent } from './mostrar/mostrar.component';
import { JornadaLaboralesGuard } from './jornada-laborales.guard';


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
    }
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [JornadaLaboralesGuard],
  },
];
@NgModule({
  declarations: [CrearComponent, EditarComponent, ListarComponent, FiltroComponent, DiaComponent, DiaEditarComponent, DiaMostrarComponent, MostrarComponent],
  imports: [
    RouterModule.forChild(routes),
    MatMenuModule,
    CommonModule,

    MatChipsModule,
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
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [
    EditarComponent,
    FiltroComponent,
    DiaComponent,
    DiaMostrarComponent,
    DiaEditarComponent,
    MostrarComponent
  ],
})
export class JornadaLaboralesModule { }
