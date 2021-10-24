import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';

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

import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { ListarService } from './listar/listar.service';

import { FiltroEditarComponent } from './destinatarios/destinatarios-filtro/filtro.component';

import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxMaskModule } from 'ngx-mask';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosSnackbarModule } from '@alcanos/services';

import { ListarEditarComponent } from './destinatarios/destinatario-listar/listar-editar.component';
import { DestinatarioCrearComponent } from './destinatarios/destinatario-crear/crear-destinatario.component';

import { LogComponent } from './log/log.component';
import { NotificacionesGuard } from './notificaciones.guard';

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
    canActivate: [NotificacionesGuard]
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [NotificacionesGuard]
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [NotificacionesGuard]
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    FiltroEditarComponent,
    ListarComponent,
    FormularioComponent, 
    ListarEditarComponent,
    DestinatarioCrearComponent,
    LogComponent
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
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    FormularioService,
    ListarService,
  ],
  entryComponents: [
    FiltroComponent,
    FiltroEditarComponent,
    FormularioComponent,
    ListarEditarComponent, 
    DestinatarioCrearComponent,
    LogComponent
  ]
})
export class NotificacionesModule { }
