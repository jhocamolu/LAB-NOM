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
  MatSidenavModule,
  MatAutocompleteModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatListModule,
  MatMenuModule,
} from '@angular/material';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';

import { ListarService } from './listar/listar.service';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { TercerosGuard } from './terceros.guard';

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
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [TercerosGuard],
  },

];

@NgModule({
  declarations: [
    FormularioComponent, 
    FiltroComponent, 
    ListarComponent, 
    MostrarComponent
  ],
  
  imports: [
    RouterModule.forChild(routes),
    MatMenuModule,
    CommonModule,

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
    MatSidenavModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    ListarService,
    FormularioService
  ],

  entryComponents: [
    FiltroComponent,
    MostrarComponent
  ],
})
export class TercerosModule { }
