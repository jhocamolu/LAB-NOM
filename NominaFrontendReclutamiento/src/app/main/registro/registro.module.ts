import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
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
  MatMenuModule,
} from '@angular/material';


import { AlcanosSharedModule } from '@alcanos/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { CookieService } from 'ngx-cookie-service';
import { RegistroComponent } from './registro.component';
import { RegistroService } from './registro.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
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
    path: 'registro',
    component: RegistroComponent,
    resolve: {
      data: RegistroService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    RegistroComponent,
  ],
  imports: [
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes),
    CommonModule,
    MatMenuModule,
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
    FuseSharedModule,
    //
    AlcanosSharedModule,
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    RegistroService,
    CurrencyPipe,
    CookieService,
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LdyCc0ZAAAAAMJrbAlB0SkQUtsuBRWYvs3zYi1y',
      } as RecaptchaSettings,
    }
  ],
  entryComponents: [
    RegistroComponent
  ]
})
export class RegistroModule { }
