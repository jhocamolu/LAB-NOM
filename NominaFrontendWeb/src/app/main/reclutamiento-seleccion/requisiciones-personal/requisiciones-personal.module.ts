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

import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';

import { ListarService } from './listar/listar.service';
import { MostrarService } from './mostrar/mostrar.service';

import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { EstadoComponent } from './estado/estado.component';
import { NgxMaskModule } from 'ngx-mask';
import { CandidatosFiltroComponent } from './candidatos/filtro/filtro.component';
import { PrimerFiltroListarComponent } from './primer-filtro/listar/listar.component';
import { PrimerFiltroComponent } from './primer-filtro/filtro/filtro.component';
import { SegundoFiltroListarComponent } from './segundo-filtro/listar/listar.component';
import { SegundoFiltroComponent } from './segundo-filtro/filtro/filtro.component';
import { SeleccionadosListarComponent } from './seleccionados/listar/listar.component';
import { SeleccionadosFiltroComponent } from './seleccionados/filtro/filtro.component';
import { CandidatosListarComponent } from './candidatos/listar/listar.component';
import { ElegirCandidatoComponent } from './modal-estados/elegir-candidato/elegir-candidato.component';
import { CompetenteComponent } from './modal-estados/competente/competente.component';
import { AptoComponent } from './modal-estados/apto/apto.component';
import { AnularComponent } from './modal-estados/anular/anular.component';
import { MostrarHvComponent } from './mostrar-hv/mostrar-hv.component';
import { DescartadoComponent } from './modal-estados/descartado/descartado.component';
import { MenuComponent } from './menu/menu.component';
import { RequisicionesPersonalGuard } from './requisiciones-personal.guard';



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
    canActivate: [RequisicionesPersonalGuard]
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    canActivate: [RequisicionesPersonalGuard]
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [RequisicionesPersonalGuard]
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [RequisicionesPersonalGuard]
  },
];

@NgModule({
  declarations: [
    CandidatosListarComponent,
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    MostrarComponent,
    EstadoComponent,
    FormularioComponent,
    CandidatosFiltroComponent,
    PrimerFiltroListarComponent,
    PrimerFiltroComponent,
    SegundoFiltroListarComponent,
    SegundoFiltroComponent,
    SeleccionadosListarComponent,
    SeleccionadosFiltroComponent,
    ElegirCandidatoComponent,
    CompetenteComponent,
    AptoComponent,
    AnularComponent,
    MostrarHvComponent,
    DescartadoComponent,
    MenuComponent,
    
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
    CurrencyPipe,
    ListarService,
    MostrarService,
  ],
  entryComponents: [
    FiltroComponent,
    EstadoComponent,
    CandidatosFiltroComponent,
    PrimerFiltroComponent,
    SegundoFiltroComponent,
    SeleccionadosFiltroComponent,
    CompetenteComponent,
    ElegirCandidatoComponent,
    AptoComponent,
    DescartadoComponent,
    MostrarHvComponent,

  ]
})
export class RequisicionesPersonalModule { }
