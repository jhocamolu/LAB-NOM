import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModule } from './login/login.module';
import { LogoutModule } from './logout/logout.module';

@NgModule({
    imports: [
        CommonModule,
        LoginModule,
        LogoutModule
    ],
    exports: [
        LoginModule,
        LogoutModule,
    ]
})
export class AutorizacionModule { }
