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
  MAT_DATE_FORMATS,
  DateAdapter,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material';

import { NgxMaskModule } from 'ngx-mask';

import { ListarComponent } from './listar/listar.component';
import { ListarService } from './listar/listar.service';
import { CrearComponent } from './crear/crear.component';
import { EditarComponent } from './editar/editar.component';
import { MostrarComponent } from './mostrar/mostrar.component';
import { FiltroComponent } from './filtro/filtro.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorEs } from '@material/matpaginatores';
import { AlcanosSharedModule } from '@alcanos/shared.module';
import { AlcanosDialogModule } from '@alcanos/components';
import { HoraExtrasGuard } from './hora-extras.guard';

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
    component: ListarComponent,
    resolve: {
      data: ListarService
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    canActivate: [HoraExtrasGuard]
  },
];

@NgModule({
  declarations: [
    ListarComponent,
    CrearComponent,
    EditarComponent,
    MostrarComponent,
    FiltroComponent
  ],

  imports: [
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes),
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
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatPaginatorIntl, useClass: MatPaginatorEs },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
  entryComponents: [
    FiltroComponent,
    MostrarComponent,
    CrearComponent,
    EditarComponent,
  ]
})
export class HoraExtrasModule { }
