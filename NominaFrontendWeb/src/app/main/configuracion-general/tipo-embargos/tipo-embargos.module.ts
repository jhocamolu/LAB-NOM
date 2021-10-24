import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { ListarService } from './listar/listar.service';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import {
  MatMenuModule,
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
  MAT_DIALOG_DATA
} from '@angular/material';

import { CrearComponent } from './crear/crear.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';
import { EditarComponent } from './editar/editar.component';
import { EditarService } from './editar/editar.service';
import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { EmbargarCrearComponent } from './embargar-crear/embargar-crear.component';
import { EmbargarEditarComponent } from './embargar-editar/embargar-editar.component';
import { NgxMaskModule } from 'ngx-mask';
import { TipoEmbargosGuard } from './tipo-embargos.guard';

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
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TipoEmbargosGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TipoEmbargosGuard],
  },
];

@NgModule({
  declarations: [
    CrearComponent, 
    EditarComponent, 
    FiltroComponent, 
    ListarComponent, 
    MostrarComponent,
    EmbargarEditarComponent,
    EmbargarCrearComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    
    NgxMaskModule.forRoot(),
    MatMenuModule,
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
    //
    AlcanosSharedModule,
    GestorArchivosModule
  ],
  providers: [
    ListarService,
    EditarService,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [
    CrearComponent,
    EditarComponent,
    FiltroComponent, 
    EmbargarEditarComponent,
    EmbargarCrearComponent, 
    MostrarComponent
  ]

})
export class TipoEmbargosModule { }
