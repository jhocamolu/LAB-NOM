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
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from '../../desarrollo-th/beneficios-corpo/listar/listar.component';
import { MostrarComponent } from '../beneficios-corpo/mostrar/mostrar.component';
import { MostrarService } from '../beneficios-corpo/mostrar/mostrar.service';

import { FormularioComponent } from '../../desarrollo-th/beneficios-corpo/formulario/formulario.component';
import { FormularioService } from '../../desarrollo-th/beneficios-corpo/formulario/formulario.service';
import { ListarService } from '../../desarrollo-th/beneficios-corpo/listar/listar.service';


import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxMaskModule } from 'ngx-mask';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosSnackbarModule } from '@alcanos/services';
import { NotaComponent } from './nota/nota.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { AprobarComponent } from './aprobar/aprobar.component';
import { BeneficiosGuard } from './beneficios.guard';
// import { RequisitoComponent } from './requisito/requisito.component';

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
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [BeneficiosGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [BeneficiosGuard],
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    FormularioComponent,
    NotaComponent,
    AutorizarComponent,
    AprobarComponent
  ],
  imports: [
    NgxMaskModule.forRoot(),
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
    AlcanosSnackbarModule,
  ],
  providers: [
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    CurrencyPipe,
    FormularioService,
    ListarService,
    MostrarComponent,
    MostrarService,
  ],
  entryComponents: [
    FiltroComponent,
    FormularioComponent,
    NotaComponent,
    AutorizarComponent,
    AprobarComponent
  ]
})

export class BeneficiosCorpoModule { }
