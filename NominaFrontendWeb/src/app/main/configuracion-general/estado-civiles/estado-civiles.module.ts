import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListarService } from './listar/listar.service';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import {
  MatDialogModule,
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
  MatSidenavModule,
  MatSortModule,
  MatBadgeModule,
  MatPaginatorIntl,
} from '@angular/material';

import { ListarComponent } from './listar/listar.component';
import { EditarComponent } from './editar/editar.component';
import { CrearComponent } from './crear/crear.component';
import { FiltroComponent } from './filtro/filtro.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { EstadoCivilesGuard } from './estado-civiles.guard';

const routes: Routes = [
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [EstadoCivilesGuard],
  },
];
@NgModule({
  declarations: [ListarComponent, EditarComponent, CrearComponent, FiltroComponent],
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSidenavModule,
    MatSortModule,
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
export class EstadoCivilesModule { }
