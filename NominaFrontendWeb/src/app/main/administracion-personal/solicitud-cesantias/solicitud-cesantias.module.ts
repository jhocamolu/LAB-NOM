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

import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FiltroComponent } from './filtro/filtro.component';
import { AprobarComponent } from './aprobar/aprobar.component';

import { FormularioService } from './formulario/formulario.service';
import { ListarService } from './listar/listar.service';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AprobarService } from './aprobar/aprobar.service';
import { SolicitudCesantiasGuard } from './solicitud-cesantias.guard';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MostrarService } from './mostrar/mostrar.service';

// import { LOCALE_ID } from '@angular/core';

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
    canActivate:[SolicitudCesantiasGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    canActivate:[SolicitudCesantiasGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[SolicitudCesantiasGuard],
    resolve: {
      data: MostrarService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[SolicitudCesantiasGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },


];

@NgModule({
  declarations: [
    ListarComponent,
    MostrarComponent,
    FormularioComponent,
    FiltroComponent,
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
  ],
  providers: [
    ListarService,
    FormularioService,
    AprobarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    CurrencyPipe,
    MostrarService
    //
    // {
    //   provide: LOCALE_ID,
    //   useValue: 'es-CO' // 'de' for Germany, 'fr' for France ...
    // }
  ],
  entryComponents: [
    FiltroComponent,
    MostrarComponent,
    AprobarComponent,
  ]
})
export class SolicitudCesantiasModule { }
