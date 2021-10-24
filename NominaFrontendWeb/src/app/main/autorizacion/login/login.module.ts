import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';
import { LoginComponent } from './login.component';

//Cookie service
import { CookieService } from 'ngx-cookie-service';
import { AutorizacionService } from './autorizacion.service';
import { MatProgressSpinnerModule } from '@angular/material';

const routes = [
    {
        path: 'login',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseSharedModule
    ],
    providers: [
        AutorizacionService,
        CookieService
      ],
})
export class LoginModule {
}
