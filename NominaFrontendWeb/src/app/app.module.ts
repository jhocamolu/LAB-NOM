import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';


import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { ConfiguracionGeneralModule } from './main/configuracion-general/configuracion-general.module';

import { AlcanosModule } from '@alcanos/alcanos.module';
import { alcanosConfig } from './alcanos-config';
import { AutorizacionModule } from './main/autorizacion/autorizacion.module';
import { SocketioService } from './socketio.service';
import { InterceptorService } from '@alcanos/services/interceptor.service';
import { AutenticacionGuard } from '@guard/autenticacion.guard';
import { InterceptorErrorService } from '@alcanos/services/interceptor-errors.service';
import { CookieService } from 'ngx-cookie-service';



const appRoutes: Routes = [
    {
        path:'',
        canActivate:[AutenticacionGuard],
        children:[
            
            {
                path: 'ayuda',
                loadChildren: () => import('./main/ayuda/ayuda.module').then(mod => mod.AyudaModule),
            },
            {
                path: 'plantilla',
                loadChildren: () => import('./main/plantilla/plantilla.module').then(mod => mod.PlantillaModule),
            },
            {
                path: 'configuracion',
                loadChildren: () => import('./main/configuracion-general/configuracion-general.module').then(mod => mod.ConfiguracionGeneralModule),
            },
            {
                path: 'administracion-personal',
                loadChildren: () => import('./main/administracion-personal/administracion-personal.module').then(mod => mod.AdministracionPersonalModule),
            },
            {
                path: 'nomina',
                loadChildren: () => import('./main/nomina/nomina.module').then(mod => mod.NominaModule),
            },
            {
                path: 'firma-grupo-documentos',
                loadChildren: () => import('./main/firma-grupo-documentos/firma-grupo-documentos.module').then(mod => mod.FirmaGrupoDocumentosModule),
            },
            {
                path: 'mantenimiento',
                loadChildren: () => import('./main/mantenimiento/mantenimiento.module').then(mod => mod.MantenimientoModule),
            },
            {
                path: 'novedades',
                loadChildren: () => import('./main/novedades/novedades.module').then(mod => mod.NovedadesModule),
            },
            {
                path: 'reportes',
                loadChildren: () => import('./main/reportes/reportes.module').then(mod => mod.ReportesModule),
            },
            {
                path: 'vacaciones',
                loadChildren: () => import('./main/administracion-personal/vacaciones/vacaciones.module').then(mod => mod.VacacionesModule),
            },
            {
                path: 'flujo-trabajos',
                loadChildren: () => import('./main/administracion-personal/flujo-trabajos/flujo-trabajos.module').then(mod => mod.FlujoTrabajosModule),
            },
            {
                path: 'desarrollo-th',
                loadChildren: () => import('./main/desarrollo-th/desarrollo-th.module').then(mod => mod.DesarrolloTHModule),
            },
            {
                path: 'reclutamiento-seleccion',
                loadChildren: () => import('./main/reclutamiento-seleccion/reclutamiento-seleccion.module').then(mod => mod.ReclutamientoSeleccionModule),
            },
            {
                path: 'estado',
                loadChildren: () => import('./main/paginas-errores/pagina-error.module').then(mod => mod.ErrorPageModule),
            },
            {
                path      : '',
                loadChildren: () => import('./main/dashboards/principal/principal.module').then(mod => mod.PrincipalModule)
            },
        ]
    },
    
];

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        //FuseThemeOptionsModule,


        // App modules
        LayoutModule,

        // modulos Alcanos
        AlcanosModule.forRoot(alcanosConfig),
        AutorizacionModule,
        ConfiguracionGeneralModule

    ],
    bootstrap: [
        AppComponent
    ],
    providers: [SocketioService,
        CookieService,
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorErrorService, multi: true },
    ],
})
export class AppModule {
}
