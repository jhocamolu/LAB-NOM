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

import { NgxMaskModule } from 'ngx-mask';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatosBasicosFormComponent } from './datos-basicos-form/datos-basicos-form.component';
import { DatosBasicosService } from './datos-basicos-form/datos-basicos-form.service';
import { FamiliaresFormComponent } from './familiares-form/familiares-form.component';
import { FamiliaresService } from './familiares-form/familiares-form.service';
import { EstudiosFormComponent } from './estudios-form/estudios-form.component';
import { EstudiosService } from './estudios-form/estudios-form.service';
import { ExperienciasFormComponent } from './experiencias-form/experiencias-form.component';
import { ExperienciasService } from './experiencias-form/experiencias-form.service';
import { ListarService } from './listar/listar.service';
import { MostrarService } from './mostrar/mostrar.service';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { DocumentosComponent } from './documentos/documentos.component';
import { DocumentosService } from './documentos/documentos.service';
import { MostrarContratoComponent } from './mostrar-contrato/mostrar-contrato.component';
import { HeaderComponent } from './header/header.component';
import { MostrarFamiliaresComponent } from './mostrar-familiares/mostrar-familiares.component';
import { MostrarEstudiosComponent } from './mostrar-estudios/mostrar-estudios.component';
import { MostrarExperienciasComponent } from './mostrar-experiencias/mostrar-experiencias.component';
import { BotonAccionesComponent } from './boton-acciones/boton-acciones.component';
import { CardsListarComponent } from './cards-listar/cards-listar.component';
import { AprobarFamiliarComponent } from './aprobar_familiar/aprobar.component';
import { AprobarEstudioComponent } from './aprobar_estudio/aprobar.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AprobarExperienciaComponent } from './aprobar_experiencia/aprobar.component';
import { CrearRetefuenteComponent } from './crear-retefuente/crear-retefuente.component';
import { EditarRetefuenteComponent } from './editar-retefuente/editar-retefuente.component';
import { FuncionariosGuard } from './funcionarios.guard';
import { FuncionariosTabsGuard } from './funcionariosTabs.guard';
import { CookieService } from 'ngx-cookie-service';

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
    path: 'datos-basicos',
    component: DatosBasicosFormComponent,
    canActivate:[FuncionariosGuard],
    resolve: {
      data: DatosBasicosService
    },
  },
  {
    path: ':id/datos-basicos',
    component: DatosBasicosFormComponent,
    canActivate:[FuncionariosGuard],
    resolve: {
      data: DatosBasicosService
    },
  },
  {
    path: ':id/familiar',
    component: FamiliaresFormComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: FamiliaresService
    },
  },
  {
    path: ':id/familiar/:familiarId',
    component: FamiliaresFormComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: FamiliaresService
    },
  },
  {
    path: ':id/estudio',
    component: EstudiosFormComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: EstudiosService
    },
  },
  {
    path: ':id/estudio/:estudioId',
    component: EstudiosFormComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: EstudiosService
    },
  },
  {
    path: ':id/experiencia-laboral',
    component: ExperienciasFormComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: ExperienciasService
    },
  },
  {
    path: ':id/experiencia-laboral/:experienciaId',
    canActivate:[FuncionariosTabsGuard],
    component: ExperienciasFormComponent,
    resolve: {
      data: ExperienciasService
    }
  },
  {
    path: ':id/documentos',
    component: DocumentosComponent,
    canActivate:[FuncionariosTabsGuard],
    resolve: {
      data: DocumentosService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[FuncionariosGuard],
    resolve: {
      data: MostrarService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[FuncionariosGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    DatosBasicosFormComponent,
    FamiliaresFormComponent,
    EstudiosFormComponent,
    ExperienciasFormComponent,
    DocumentosComponent,
    MostrarContratoComponent,
    HeaderComponent,
    MostrarFamiliaresComponent,
    MostrarEstudiosComponent,
    MostrarExperienciasComponent,
    BotonAccionesComponent,
    CardsListarComponent,
    AprobarFamiliarComponent,
    AprobarEstudioComponent,
    AprobarExperienciaComponent,
    CrearRetefuenteComponent,
    EditarRetefuenteComponent,
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
    AlcanosConfirmDialogModule,
    GestorArchivosModule,
    //
    AlcanosSharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    CurrencyPipe,
    DatosBasicosService,
    FamiliaresService,
    EstudiosService,
    ExperienciasService,
    DocumentosService,
    MostrarService,
    ListarService,
    CookieService
  ],
  entryComponents: [
    FiltroComponent,
    MostrarContratoComponent,
    HeaderComponent,
    MostrarFamiliaresComponent,
    MostrarEstudiosComponent,
    MostrarExperienciasComponent,
    AprobarFamiliarComponent,
    AprobarEstudioComponent,
    AprobarExperienciaComponent,
    CrearRetefuenteComponent,
    EditarRetefuenteComponent
  ]
})
export class FuncionariosModule { }

