import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
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
  MatMenuModule,
  MAT_DATE_FORMATS,
  DateAdapter,
} from '@angular/material';

import { AlcanosDialogModule } from '@alcanos/components';
import { MatPaginatorEs } from '@material/matpaginatores';
import { NgxMaskModule } from 'ngx-mask';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlcanosSharedModule } from '@alcanos/shared.module';

import { FiltroComponent } from './filtro/filtro.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { MostrarComponent } from './mostrar/mostrar.component';
import { InformacionComponent } from './informacion/informacion.component';
import { CargarComponent } from './cargar/cargar.component';

import { MostrarService } from './mostrar/mostrar.service';
import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { OtrasNovedadesGuard } from './otras-novedades.guard';



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
    path: 'crear',
    component: FormularioComponent,
    canActivate:[OtrasNovedadesGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    canActivate:[OtrasNovedadesGuard],
    resolve: {
      data: FormularioService
    },
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    canActivate:[OtrasNovedadesGuard],
    resolve: {
      data: MostrarService
    },
  },
  {
    path: 'cargar',
    component: CargarComponent,
    // canActivate:[OtrasNovedadesGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    canActivate:[OtrasNovedadesGuard],
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
];

@NgModule({
  declarations: [
    ListarComponent,
    FormularioComponent,
    MostrarComponent,
    FiltroComponent,
    CargarComponent,
    InformacionComponent
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
    MatBadgeModule,
    MatAutocompleteModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
    //
    AlcanosDialogModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    MostrarService,
    FormularioService
  ],
  entryComponents: [
    // ListarService,
    FiltroComponent,
    MostrarComponent,
    InformacionComponent
  ]
})
export class OtraNovedadesModule { }
