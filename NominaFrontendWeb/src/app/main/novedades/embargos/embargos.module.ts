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

import { FiltroComponent } from './filtro/filtro.component';
import { ListarComponent } from './listar/listar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FormularioComponent } from './formulario/formulario.component';
import { FormularioService } from './formulario/formulario.service';
import { ListarService } from './listar/listar.service';
import { MostrarService } from './mostrar/mostrar.service';

import { GestorArchivosModule } from 'app/main/gestor-archivos/gestor-archivos.module';
import { MatPaginatorEs } from '@material/matpaginatores';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgxMaskModule } from 'ngx-mask';

import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosSnackbarModule } from '@alcanos/services';
import { EmbargosGuard } from './embargos.guard';
import { AnularService } from '../embargos/anular/anular.service';
import { AnularComponent } from './anular/anular.component';
import { TerminarComponent } from './terminado/terminado.component';


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
    canActivate: [EmbargosGuard]
  },
  {
    path: ':id/editar',
    component: FormularioComponent,
    resolve: {
      data: FormularioService
    },
    canActivate: [EmbargosGuard]
  },
  {
    path: ':id/mostrar',
    component: MostrarComponent,
    resolve: {
      data: MostrarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    //canActivate: [AusentismosGuard],
  },
  {
    path: '**',
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [EmbargosGuard]
  },
];

@NgModule({
  declarations: [
    FiltroComponent,
    ListarComponent,
    MostrarComponent,
    FormularioComponent,
    TerminarComponent,
    AnularComponent
  ],
  imports: [
    NgxMaskModule.forRoot(),
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
    //MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatListModule,
    //
    FuseSidebarModule,
    FuseSharedModule,
    //
    AlcanosSharedModule,
    GestorArchivosModule,
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    FormularioService,
    ListarService,
    MostrarService,
    CurrencyPipe,
  ],
  entryComponents: [
    FiltroComponent,
    FormularioComponent,
    TerminarComponent,
    MostrarComponent,
    AnularComponent
  ]
})
export class EmbargosModule { }
