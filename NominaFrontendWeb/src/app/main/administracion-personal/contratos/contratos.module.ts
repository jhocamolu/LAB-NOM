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
  DateAdapter,
  MAT_DATE_FORMATS,
  MatListModule,
  MatMenuModule,
} from '@angular/material';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';

import { ContratosFormComponent } from './contratos-form/contratos-form.component';
import { ContratosService } from './contratos-form/contratos-form.service'
import { ListarService } from './listar/listar.service';
import { MostrarService } from './mostrar/mostrar.service';

import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MostrarOtrosiComponent } from './mostrar-otrosi/mostrar-otrosi.component';
import { CrearOtrosiComponent } from './crear-otrosi/crear-otrosi.component';
import { CrearOtrosiService } from './crear-otrosi/crear-otrosi.service';
import { HeaderComponent } from './header/header.component';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { CancelarComponent } from './cancelar/cancelar.component';
import { NgxMaskModule } from 'ngx-mask';
import { CookieService } from 'ngx-cookie-service';
import { FinalizarComponent } from './finalizar/finalizar.component';
import { ContratosGuard } from './contratos.guard';
import { OtrosSiGuard } from './otrosi.guard';

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
    path: 'crear',
    component: ContratosFormComponent,
    canActivate:[ContratosGuard],
    resolve: {
      data: ContratosService
    },
  },
  {
    path: ':id/editar',
    component: ContratosFormComponent,
    canActivate:[ContratosGuard],
    resolve: {
      data: ContratosService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[ContratosGuard],
    resolve: {
      data: MostrarService
    },
  },

  {
    path: ':id/crear-otrosi',
    component: CrearOtrosiComponent,
    canActivate:[OtrosSiGuard],
    resolve: {
      data: CrearOtrosiService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[ContratosGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    HeaderComponent,
    ListarComponent,
    MostrarComponent,
    MostrarOtrosiComponent,
    CrearOtrosiComponent,
    MostrarComponent,
    ContratosFormComponent,
    CancelarComponent,
    FinalizarComponent
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
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    GestorArchivosModule,
    //
    AlcanosSharedModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    ContratosService,
    ListarService,
    MostrarService,
    CrearOtrosiService,
    CurrencyPipe,
    CookieService
  ],
  entryComponents: [
    FiltroComponent,
    MostrarOtrosiComponent,
    ContratosFormComponent,
    HeaderComponent,
    CancelarComponent,
    FinalizarComponent
  ]
})
export class ContratosModule { }
