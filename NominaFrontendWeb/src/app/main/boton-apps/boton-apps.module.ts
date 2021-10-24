import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BotonAppsComponent } from './boton-apps.component';
import { MatIconModule, MatMenuModule, MatButtonModule } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';



@NgModule({
  declarations: [BotonAppsComponent],
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    CommonModule
  ],
  exports: [
    BotonAppsComponent
  ],
  providers : [
    CookieService
  ]

})
export class BotonAppsModule { }
