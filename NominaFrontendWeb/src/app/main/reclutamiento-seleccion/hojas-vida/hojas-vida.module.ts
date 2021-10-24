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
import { EstudiosFormComponent } from './estudios-form/estudios-form.component';
import { EstudiosService } from './estudios-form/estudios-form.service';
import { ExperienciasFormComponent } from './experiencias-form/experiencias-form.component';
import { ExperienciasService } from './experiencias-form/experiencias-form.service';
import { ListarService } from './listar/listar.service';
import { MostrarService } from './mostrar/mostrar.service';
import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { DocumentosComponent } from './documentos/documentos.component';
import { DocumentosService } from './documentos/documentos.service';
import { HeaderComponent } from './header/header.component';
import { MostrarEstudiosComponent } from './mostrar-estudios/mostrar-estudios.component';
import { MostrarExperienciasComponent } from './mostrar-experiencias/mostrar-experiencias.component';
import { BotonAccionesComponent } from './boton-acciones/boton-acciones.component';
import { CardsListarComponent } from './cards-listar/cards-listar.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { HojasVidaGuard } from './hojas-vida.guard';
import { SeleccionarComponent } from './seleccionar/seleccionar.component';


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
    resolve: {
      data: DatosBasicosService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/datos-basicos',
    component: DatosBasicosFormComponent,
    resolve: {
      data: DatosBasicosService
    },
    canActivate: [HojasVidaGuard]
  },
  
  {
    path: ':id/estudio',
    component: EstudiosFormComponent,
    resolve: {
      data: EstudiosService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/estudio/:estudioId',
    component: EstudiosFormComponent,
    resolve: {
      data: EstudiosService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/experiencia-laboral',
    component: ExperienciasFormComponent,
    resolve: {
      data: ExperienciasService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/experiencia-laboral/:experienciaId',
    component: ExperienciasFormComponent,
    resolve: {
      data: ExperienciasService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/documentos',
    component: DocumentosComponent,
    resolve: {
      data: DocumentosService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [HojasVidaGuard]
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [HojasVidaGuard]
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    DatosBasicosFormComponent,
    EstudiosFormComponent,
    ExperienciasFormComponent,
    DocumentosComponent,
    HeaderComponent,
    MostrarEstudiosComponent,
    MostrarExperienciasComponent,
    BotonAccionesComponent,
    CardsListarComponent,
    SeleccionarComponent 
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
    DatosBasicosService,
    EstudiosService,
    ExperienciasService,
    DocumentosService,
    MostrarService,
    ListarService
  ],
  entryComponents: [
    FiltroComponent,
    HeaderComponent,
    MostrarEstudiosComponent,
    MostrarExperienciasComponent,
    SeleccionarComponent 
  ]

})
export class HojasVidaModule { }
