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
  MatSidenavModule,
  MatTooltipModule,
  MatBadgeModule,
  MatPaginatorIntl,
} from '@angular/material';

import { CrearComponent } from './crear/crear.component';
import { EditarComponent } from './editar/editar.component';
import { ListarComponent } from './listar/listar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { DiagnosticosGuard } from './diagnosticos.guard';

const routes: Routes = [
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [DiagnosticosGuard],
  },
];
@NgModule({
  declarations: [CrearComponent, EditarComponent, ListarComponent, FiltroComponent],
  imports: [
    RouterModule.forChild(routes),
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
    MatSidenavModule,
    MatBadgeModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule
  ],
  providers: [
    ListarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs }
  ],
  entryComponents: [
    CrearComponent,
    EditarComponent,
    FiltroComponent
  ],
})
export class DiagnosticosModule { }
