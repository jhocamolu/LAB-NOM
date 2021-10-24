import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

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
  MAT_DATE_FORMATS,
  DateAdapter,
  MatMenuModule,
} from '@angular/material';

import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';

import { FiltroComponent } from './filtro/filtro.component';

import { MostrarLibroComponent } from './mostrar-libro/mostrar-libro.component';
import { MostrarDetalleComponent } from './mostrar-detalle/mostrar-detalle.component';
import { NgxMaskModule } from 'ngx-mask';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosDialogModule } from '@alcanos/components';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MostrarLibroService } from './mostrar-libro/mostrar-libro.service';
import { ReporteFuncionarioComponent } from './reporte-funcionario/reporte-funcionario.component';
import { ReporteConsolidadoComponent } from './reporte-consolidado/reporte-consolidado.component';
import { VacacionesGuard } from './vacaciones.guard';

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
    path: ':id/mostrar',
    component: MostrarLibroComponent,
    canActivate:[VacacionesGuard],
    resolve: {
      data: MostrarLibroService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[VacacionesGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    ListarComponent, 
    FiltroComponent,
    MostrarLibroComponent, 
    MostrarDetalleComponent,
    ReporteFuncionarioComponent,
    ReporteConsolidadoComponent
  ],

  imports: [
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes),
    CommonModule,

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
    MatAutocompleteModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
    //
    AlcanosDialogModule,

  ],

  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    CurrencyPipe,
    MostrarLibroService,
    ListarService
  ],

  entryComponents: [
    FiltroComponent,
    MostrarDetalleComponent,
    ReporteFuncionarioComponent,
    ReporteConsolidadoComponent
  ]
})
export class LibroVacacionesModule { }
