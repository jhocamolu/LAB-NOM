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
    MatChipsModule,
    MatMenuModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material';

import { FiltroComponent } from './filtro/filtro.component';

import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';
import { ListarService } from './listar/listar.service';


import { ActividadesFiltroComponent } from './actividades/filtro/filtro.component';
import { ActividadesListarComponent } from './actividades/listar/listar.component';
import { CentroCostosListarComponent } from './centro-costos/listar/listar.component';
import { CentroCostosFiltroComponent } from './centro-costos/filtro/filtro.component';
import { ObtenerActividadComponent } from './obtener-actividad/aprobar.component';


import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { ProcesarCostosGuard } from './proceso-costos.guard';


import { ActividadesListarCargoComponent } from './generar-registros/cargo/listar-cargo/listar.component';
import { FormularioActividadFuncionarioComponent } from './generar-registros/funcionario/formulario-funcionario/formulario.component';

import { NgxMaskModule } from 'ngx-mask';
import { ManualActividadComponent } from './registro-manual/manual.component';

import { ActividadesListarFuncionarioComponent } from './generar-registros/funcionario/listar-funcionario/listar.component';
import { ActividadesListarFuncionarioService } from './generar-registros/funcionario/listar-funcionario/listar.service';
import { FormularioActividadCargoComponent } from './generar-registros/cargo/formulario-cargo/formulario.component';
import { ActividadesListarCargoService } from './generar-registros/cargo/listar-cargo/listar.service';

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
        component: MostrarComponent,
        resolve: {
            data: MostrarService
        },
        canActivate: [ProcesarCostosGuard],
    },
    {
        path: ':id/generar-manualmente-cargo',
        component: ActividadesListarCargoComponent,
        canActivate: [ProcesarCostosGuard],
        resolve: {
            data: ActividadesListarCargoService
        },
    },
    {
        path: ':id/generar-manualmente-funcionario',
        component: ActividadesListarFuncionarioComponent,
        resolve: {
            data: ActividadesListarFuncionarioService
        },
        canActivate: [ProcesarCostosGuard],
    },
    {
        path: '**',
        component: ListarComponent,
        resolve: {
            data: ListarService
        },
        canActivate: [ProcesarCostosGuard],
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
];

@NgModule({
    declarations: [
        FiltroComponent,
        ListarComponent,
        MostrarComponent,
        ActividadesListarComponent,
        ActividadesFiltroComponent,
        //
        CentroCostosListarComponent,
        CentroCostosFiltroComponent,
        //
        ObtenerActividadComponent,
        ManualActividadComponent,
        FormularioActividadFuncionarioComponent,
        FormularioActividadCargoComponent,
        // generar-registros
        ActividadesListarFuncionarioComponent,
        ActividadesListarCargoComponent

    ],
    imports: [
        RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
        MatMenuModule,
        CommonModule,
        MatChipsModule,
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
        GestorArchivosModule
    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        ListarService,
        MostrarService
    ],
    entryComponents: [
        ActividadesFiltroComponent,
        CentroCostosFiltroComponent,
        FiltroComponent,
        ObtenerActividadComponent,
        ManualActividadComponent,
        FormularioActividadFuncionarioComponent,
        FormularioActividadCargoComponent
    ]
})
export class ProcesarCostosModule { }
