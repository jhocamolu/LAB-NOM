import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorPickerModule } from 'ngx-color-picker';
import { CalendarModule as AngularCalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatSnackBarModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatPaginatorIntl } from '@angular/material';
import { AlcanosConfirmDialogModule } from '@alcanos/components';

import { MostrarService } from './mostrar/mostrar.service';
import { MostrarComponent } from './mostrar/mostrar.component';

import { FormularioComponent } from './formulario/formulario.component';

import localeEs from '@angular/common/locales/es';
import { MatPaginatorEs } from '@material/matpaginatores';
import { CalendarioGuard } from './calendario.guard';

registerLocaleData(localeEs);


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
    path: '**',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [CalendarioGuard],
  }
];

@NgModule({
  declarations: [MostrarComponent, FormularioComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),

    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,

    FuseSidebarModule,
    FuseSharedModule,

    AngularCalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    ColorPickerModule,
    AlcanosConfirmDialogModule,

  ],

  providers: [
    MostrarService,
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],

  entryComponents: [
    FormularioComponent,

  ]

})
export class CalendarioModule { }
