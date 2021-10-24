import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import {
    MatDialogRef,
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
    MatStepperModule,
} from '@angular/material';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { AlcanosConfirmDialogModule } from '@alcanos/components';
import { AlcanosSnackbarModule } from '@alcanos/services';

import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { InformacionBasicaComponent } from './informacion-basica/informacion-basica.component';
import { InformacionBasicaService } from './informacion-basica/informacion-basica.service';

import { NavegacionComponent } from './navegacion/navegacion.component';
import { NovedadesComponent } from './novedades/novedades.component';

import { AsignacionService } from './asignacion/asignacion.service';
import { AsignacionAgregarComponent } from './asignacion/agregar/agregar.component';
import { AsignacionFiltroComponent } from './asignacion/filtro/filtro.component';
import { AsignacionListarComponent } from './asignacion/listar/listar.component';
import { HeaderComponent } from './header/header.component';
import { MatPaginatorEs } from '@material/matpaginatores';
import { NovedadesService } from './novedades/novedades.service';
import { PrenominaService } from './prenomina/prenomina.service';
import { FiltroNovedadesComponent } from './novedades/filtro-novedades/filtro-novedades.component';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { PrenominaFiltroComponent } from './prenomina/filtro/filtro.component';
import { PrenominaListarComponent } from './prenomina/listar/listar.component';
import { MostrarPrenominaComponent } from './prenomina/mostrar/mostrar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxMaskModule } from 'ngx-mask';

import { AprobarComponent } from './aprobar/aprobar.component';
import { AprobarService } from './aprobar/aprobar.service';
import { CardComponent } from './aprobar/cards/card.component';
import { MenuComponent } from './menu/menu.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormularioComponent } from './novedades/formulario/formulario.component';
//
import { DatosComponent } from './aprobar/datos/datos.component';
import { LiquidacionNominaGuard } from './liquidacion-nomina.guard';


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
        component: InformacionBasicaComponent,
        resolve: {
            data: InformacionBasicaService
        },
    },
    {
        path: ':id/aprobar',
        component: AprobarComponent,
        resolve: {
            data: AprobarService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
    {
        path: ':id/basica',
        component: InformacionBasicaComponent,
        resolve: {
            data: InformacionBasicaService
        },
    },
    {
        path: ':id/asignacion',
        component: AsignacionListarComponent,
        resolve: {
            data: AsignacionService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
    {
        path: ':id/novedades',
        component: NovedadesComponent,
        resolve: {
            data: NovedadesService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
    {
        path: ':id/prenomina',
        component: PrenominaListarComponent,
        resolve: {
            data: PrenominaService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    },
    {
        path: '**',
        component: ListarComponent,
        resolve: {
            data: ListarService
        },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [LiquidacionNominaGuard],
    },
];

@NgModule({
    declarations: [
        NavegacionComponent,
        ListarComponent,
        InformacionBasicaComponent,
        AsignacionListarComponent,
        AsignacionAgregarComponent,
        AsignacionFiltroComponent,
        NovedadesComponent,
        HeaderComponent,
        FiltroNovedadesComponent,
        //
        PrenominaListarComponent,
        PrenominaFiltroComponent,
        MostrarPrenominaComponent,
        FormularioComponent,
        AprobarComponent,      
        CardComponent, MenuComponent, DatosComponent 
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
        CdkStepperModule,
        MatStepperModule,
        MatCheckboxModule,
        //
        FuseSidebarModule,
        FuseSharedModule,
        FuseWidgetModule,
        NgxChartsModule,
        //
        AlcanosConfirmDialogModule,
        AlcanosSnackbarModule,
        //
        AlcanosSharedModule
    ],
    providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
        CurrencyPipe,
        ListarService,
        InformacionBasicaService,
        AsignacionService,
    ],
    entryComponents: [
        AsignacionAgregarComponent,
        AsignacionFiltroComponent,
        FiltroNovedadesComponent,
        PrenominaFiltroComponent,
        MostrarPrenominaComponent,
        FormularioComponent,
        DatosComponent, 
    ]
})
export class LiquidacionNominaModule { }
