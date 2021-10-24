import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseSidebarModule } from '@fuse/components';
import { MatCardModule } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { AvanceComponent } from './avance.component';
import { AvanceService } from './avances.service';


const routes: Routes = [
    // {
    //     path     : '**',
    //     component: AvanceComponent,
    //     resolve  : {
    //         contacts: AvanceService
    //     }
    // }
];

@NgModule({
    declarations   : [
    ],
    imports        : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,
        MatCardModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseSidebarModule
    ],
    providers      : [
        AvanceService,
        CookieService
    ],
    entryComponents: [
    ]
})
export class AvanceModule
{
}
