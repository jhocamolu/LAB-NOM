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

import { AlcanosModule } from '@alcanos/alcanos.module';
import { alcanosConfig } from './alcanos-config';
import { AutorizacionModule } from './main/autorizacion/autorizacion.module';
import { SocketioService } from './socketio.service';
import { InterceptorService } from '@alcanos/services/interceptor.service';
import { AutenticacionGuard } from '@guard/autenticacion.guard';
import { InterceptorErrorService } from '@alcanos/services/interceptor-errors.service';



const appRoutes: Routes = [
    {
        path:'',
        children:[
            {
                path: '',
                loadChildren: () => import('./main/dashboard/dashboard.module').then(mod => mod.DashboardModule),
                canActivate:[AutenticacionGuard],
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
        RouterModule.forRoot(appRoutes,{
            scrollPositionRestoration: 'enabled'
        }),

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

    ],
    bootstrap: [
        AppComponent
    ],
    providers: [SocketioService,
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: InterceptorErrorService, multi: true },
    ],
})
export class AppModule {
}
