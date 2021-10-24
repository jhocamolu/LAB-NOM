import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  MAT_DIALOG_DATA,
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
  MatSidenavModule,

} from '@angular/material';

import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';

import { FiltroComponent } from './filtro/filtro.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';

import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { AlcanosSnackbarModule } from '@alcanos/services';
import { NgxMaskModule } from 'ngx-mask';
import { AprobarComponent } from './aprobar/aprobar.component';
import { AutorizarComponent } from './autorizar/autorizar.component';
import { TerminarComponent } from './terminar/terminar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { AnularComponent } from './anular/anular.component';
import { SolicitudVacacionesGuard } from './solicitudVacaciones.guard';

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
    canActivate:[SolicitudVacacionesGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    canActivate:[SolicitudVacacionesGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[SolicitudVacacionesGuard],
    resolve: {
      data: MostrarService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[SolicitudVacacionesGuard],
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
    MostrarComponent,
    AprobarComponent,
    AutorizarComponent,
    TerminarComponent,
    FormularioComponent,
    AnularComponent
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
    MatSidenavModule,
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
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    ListarService,
    MostrarService,
    MostrarComponent,
  ],
  entryComponents: [
    FiltroComponent,
    MostrarComponent,
    AprobarComponent,
    AutorizarComponent,
    TerminarComponent,
    AnularComponent

  ]

})
export class SolicitudVacacionesModule { }
