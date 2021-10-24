import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import {
  MatDialogModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatMenuModule,
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
  MAT_DATE_FORMATS,
  DateAdapter,
} from '@angular/material';

import { FormularioComponent } from './formulario/formulario.component';
import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';

import { AlcanosDialogModule } from '@alcanos/components';
import { MatPaginatorEs } from '@material/matpaginatores';
import { ListarService } from './listar/listar.service';
import { FormularioService } from './formulario/formulario.service';
import { NgxMaskModule } from 'ngx-mask';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { LibranzasGuard } from './libranzas.guard';

import { MostrarComponent } from './mostrar/mostrar.component';
import { MostrarService } from './mostrar/mostrar.service';

import { AprobarComponent } from './aprobar/aprobar.component';
import { TerminarComponent } from './terminar/aprobar.component';

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
    resolve: {
      data: FormularioService
    },
    canActivate: [LibranzasGuard]
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    canActivate: [LibranzasGuard]
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    canActivate: [LibranzasGuard]
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [LibranzasGuard]
  },
];

@NgModule({
  declarations: [
    FormularioComponent, 
    FiltroComponent, 
    ListarComponent, 
    MostrarComponent, 
    AprobarComponent,
    TerminarComponent
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
    CurrencyPipe
  ],
  entryComponents: [
    FiltroComponent, 
    AprobarComponent,
    TerminarComponent
  ]

})
export class LibranzasModule { }
