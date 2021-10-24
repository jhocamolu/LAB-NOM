import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModule } from './login/login.module';
import { LogoutModule } from './logout/logout.module';
import { RegistroModule } from '../registro/registro.module';
import { RecuperarModule } from '../recuperar-contrasena/recuperar.module';

@NgModule({
    imports: [
        CommonModule,
        LoginModule,
        LogoutModule,
        RegistroModule,
        RecuperarModule
    ],
    exports: [
        LoginModule,
        LogoutModule,
        RegistroModule,
        RecuperarModule
    ]
})
export class AutorizacionModule { }
