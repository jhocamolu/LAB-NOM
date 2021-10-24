import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import { PrincipalComponent } from './principal.component';
import { PrincipalService } from './principal.service';
import { CookieService } from 'ngx-cookie-service';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
registerLocaleData(localeEsCo, 'es-Co');
const routes: Routes = [
    {
        path     : '**',
        component: PrincipalComponent,
        resolve  : {
            data: PrincipalService
        }
    }
];

@NgModule({
    declarations: [
        PrincipalComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTableModule,
        MatTabsModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseSidebarModule,
        FuseWidgetModule
    ],
    providers: [
        PrincipalService,
        CookieService,
        {provide: LOCALE_ID, useValue: 'es-Co' }
    ]
})
export class PrincipalModule
{
}

